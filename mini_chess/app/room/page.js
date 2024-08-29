"use client";
import React, { useState, useEffect } from "react";
import { possibleMoves, piecesData } from "./components/utils";
import ErrorNotification from "./components/ErrorNotification";
import { useSearchParams } from "next/navigation";

const GameLayout = () => {
    const searchParams = useSearchParams();
    const type = searchParams.get('type');
    const roomCode = searchParams.get('roomCode');

    const initailPossibleLayout = [
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
    ];

    const [isLoading, setIsLoading] = useState(false);
    const [isResultModalOpen, setIsResultModalOpen] = useState(false);
    const [showErrorNotification, setShowErrorNotification] = useState(false);
    const [isVictory, setIsVictory] = useState(null);
    const [gameEnded, setGameEnded] = useState(false);
    const [socket, setSocket] = useState(null);
    const [player, setPlayer] = useState(null);
    const [myTurn, setMyTurn] = useState(false);
    const [layout, setLayout] = useState(initailPossibleLayout);
    const [moveHistory, setMoveHistory] = useState([]);
    const [possibleMoveLayout, setPossibleMoveLayout] = useState(initailPossibleLayout);
    const [selectedPiece, setSelectedPiece] = useState({
        piece: "",
        pos_x: -1,
        pos_y: -1,
    });

    useEffect(() => {
        const ws = new WebSocket("ws://localhost:8080");
        setSocket(ws);

        ws.onopen = () => {
            if (roomCode && type == "CREATE_ROOM") {
                ws.send(JSON.stringify({ type: 'CREATE_ROOM', roomCode }));
            } else {
                const newRoomCode = Math.random().toString(36).substr(2, 5);
                ws.send(JSON.stringify({ type: 'JOIN_ROOM', roomCode: roomCode }));
            }
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("Message from server:", data);

            switch (data.type) {
                case 'ROOM_CREATED':
                    setPlayer(data.player);
                    setLayout(data.layout);
                    setMyTurn(data.turn === data.player);
                    break;

                case 'ROOM_JOINED':
                    setPlayer(data.player);
                    setLayout(data.layout);
                    setMyTurn(data.turn === data.player);
                    break;

                case 'PLAYER_JOINED':
                    // Handle when a player joins
                    break;

                case 'NEW_GAME':
                    setLayout(data.layout);
                    setMyTurn(data.turn === player);
                    setMoveHistory([]);
                    setGameEnded(false);
                    break;

                case 'GAME_STATE_UPDATE':
                    setLayout(data.layout);
                    setMyTurn(data.turn === player);
                    setMoveHistory(data.moveHistory);
                    break;

                case 'GAME_OVER':
                    if (data.result === player) {
                        setIsVictory(true);
                    } else {
                        setIsVictory(false);
                    }
                    setIsResultModalOpen(true);
                    setGameEnded(true);
                    break;

                case 'INVALID_MOVE':
                    setShowErrorNotification(true);
                    break;

                case 'ERROR':
                    console.error(data.message);
                    break;

                default:
                    break;
            }
        };

        return () => ws.close();
    }, [player, roomCode]);

    const selectPiece = (e) => {
        const piece = e.target.textContent;

        if (
            (selectedPiece.piece === "" &&
                myTurn &&
                ((player === "A" && piece.slice(0, 1) === "A") ||
                    (player === "B" && piece.slice(0, 1) === "B"))) ||
            (piece !== "" &&
                myTurn &&
                piece.slice(0, 1) === player &&
                selectedPiece.piece !== piece)
        ) {
            setSelectedPiece({
                piece,
                pos_x: e.target.dataset.x,
                pos_y: e.target.dataset.y,
            });

            const updatedLayout = possibleMoves(
                piece,
                layout,
                {
                    pos_x: e.target.dataset.x,
                    pos_y: e.target.dataset.y,
                },
                myTurn
            );
            setPossibleMoveLayout(updatedLayout);
        } else if (selectedPiece.piece !== "") {
            const x = parseInt(e.target.dataset.x);
            const y = parseInt(e.target.dataset.y);

            socket.send(
                JSON.stringify({
                    type: "PLAYER_MOVE",
                    piece: selectedPiece.piece,
                    pos_x: x,
                    pos_y: y,
                    layout,
                    myTurn,
                    selectedPiece,
                    roomCode, // Added roomCode to ensure correct game room is updated
                })
            );

            setSelectedPiece({ piece: "", pos_x: -1, pos_y: -1 });
            setPossibleMoveLayout(initailPossibleLayout);
        }
    };

    const handleMoveClick = (direction) => {
        if (!selectedPiece.piece) return;
        const piece = selectedPiece.piece;
        let moves = [];
        if (piece.slice(-2)[0] === "P") {
            moves = piecesData["P"];
        } else if (piece.slice(-2)[0] === "H") {
            moves = piecesData[piece.slice(-2)];
        }
        const move = moves[direction];

        if (move) {
            const newPosX = parseInt(selectedPiece.pos_x) + move[0];
            const newPosY = parseInt(selectedPiece.pos_y) + move[1];

            socket.send(
                JSON.stringify({
                    type: "PLAYER_MOVE",
                    piece: selectedPiece.piece,
                    pos_x: newPosX,
                    pos_y: newPosY,
                    layout,
                    myTurn,
                    selectedPiece,
                    roomCode, // Added roomCode to ensure correct game room is updated
                })
            );

            setSelectedPiece({ piece: "", pos_x: -1, pos_y: -1 });
            setPossibleMoveLayout(initailPossibleLayout);
        }
    };

    const renderMoveHistory = () => {
        const lastMoves =
            moveHistory.length > 10 ? moveHistory.slice(-10) : moveHistory;
        return (
            <div className="move-history">
                <h3 className="text-lg font-semibold">Move History</h3>
                <ul className="grid grid-cols-2 gap-4">
                    {lastMoves.map((move, index) => (
                        <li key={index} className="list-disc list-inside">
                            {move}
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    const renderPossibleMoveButtons = () => {
        let moves = [];

        if (selectedPiece.piece) {
            const piece = selectedPiece.piece;
            if (piece.slice(-2)[0] === "P") {
                moves = piecesData["P"];
            } else if (piece.slice(-2)[0] === "H") {
                moves = piecesData[piece.slice(-2)];
            }

            return Object.keys(moves).map((direction) => (
                <button
                    key={direction}
                    className="btn"
                    onClick={() => handleMoveClick(direction)}
                >
                    {direction}
                </button>
            ));
        }

        return null;
    };

    if (isLoading)
        return (
            <div>
                <div> Game is already going on</div>
                <div> Either visit the tabs of ongoing game or restart server</div>
            </div>
        );
    return (
        <div className="flex h-[100vh] w-full justify-center px-16">
        <div className="w-full h-fit flex flex-col gap-2 ">
            <div className="h-[5vh] ">
                {showErrorNotification && (
                    <ErrorNotification
                    setShowErrorNotification={setShowErrorNotification}
                    />
                )}
            </div>
            <div className="flex gap-2 justify-between h-[90vh]  ">
                <div className="w-3/12 h-full"> {moveHistory && renderMoveHistory()} </div>
                <div className="w-6/12 text-center gap-2 flex flex-col h-full ">player = {myTurn ? "Your Turn" : "Waiting for opponent"},{ }
            {layout.map((row, rowIndex) => (
                <div key={rowIndex} className=" flex gap-2 justify-center">
                    {row.map((cell, colIndex) => (
                        <div
                            key={colIndex}
                            data-x={rowIndex}
                            data-y={colIndex}
                            className={`border-2 border-white w-16 h-16 text-center align-center py-4 
                                ${cell === selectedPiece.piece && cell !== ""
                                    ? "bg-gray-600"
                                    : ""
                                } 
                                ${possibleMoveLayout[rowIndex][colIndex] === "*"
                                    ? "bg-green-300"
                                    : ""
                                } ${myTurn && player == cell[0] ? "text-green-400" : ""} `}
                            onClick={selectPiece}
                            >
                            {cell !== "*" ? cell : ""}
                        </div>
                    ))}
                </div>
            ))}
            <div className="w-full justify-center gap-4 text-center p-4">
                <div className="flex flex-col w-full justify-center gap-4  h-[10vh] ">
                    {selectedPiece.piece && (
                    
                        <div>Selected Piece = {selectedPiece.piece}</div>
                    )}
                    <div className="flex gap-4 justify-center w-full">
                        {renderPossibleMoveButtons()}
                    </div>
                </div>
                 {isResultModalOpen && (
                <dialog open className="modal">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">
                            {" "}
                            {isVictory ? "Congratulations!" : "Better Luck Next Time"}{" "}
                        </h3>
                        <p className="py-4">{isVictory ? "You Won!" : "You Lose"}</p>
                        <div className="modal-action">
                            <button
                                className="btn"
                                onClick={() => setIsResultModalOpen(false)}
                                >
                                Close
                            </button>
                            <button
                                className="btn"
                                onClick={() => {
                                    setIsResultModalOpen(false);
                                    socket.send(
                                        JSON.stringify({
                                            type: "NEW_GAME",
                                            roomCode, // Added roomCode to ensure new game starts in correct room
                                        })
                                    );
                                }}
                                >
                                New Game
                            </button>
                        </div>
                    </div>
                </dialog>
            )}
            

                </div>
                </div>
                <div className="w-3/12">
                <div className="flex gap-4 flex-row-reverse ">
            <button
                className="btn"
                onClick={() => {
                    let result;
                    if (player == "A") {
                        result = "B";
                    } else {
                        result = "A";
                    }
                    socket.send(
                        JSON.stringify({
                            type: "RESIGN",
                            result: result,
                            roomCode, // Added roomCode to ensure resignation affects the correct room
                        })
                    );
                    setGameEnded(true);
                }}
            >
                Resign
            </button>
            {gameEnded && (
                <button
                className="btn"
                onClick={() => {
                    let result;
                    if (player == "A") {
                        result = "B";
                    } else {
                        result = "A";
                    }
                    socket.send(
                        JSON.stringify({
                            type: "NEW_GAME",
                            result: result,
                            roomCode, // Added roomCode to ensure new game starts in correct room
                        })
                    );
                }}
                >
                    New Game
                </button>
            )}
             </div></div>
            </div>     
           
            </div>
        </div>
    );
};

export default GameLayout;
