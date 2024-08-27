"use client";
import React, { useState, useEffect } from "react";
import { possibleMoves, piecesData } from "./utils";
import ErrorNotification from "./ErrorNotification";

const GameLayout = () => {
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
    const [notify, setNotify] = useState(false);
    const [socket, setSocket] = useState(null);
    const [player, setPlayer] = useState(null);
    const [myTurn, setMyTurn] = useState(false);
    const [layout, setLayout] = useState([]);
    const [moveHistory, setMoveHistory] = useState([]);
    const [possibleMoveLayout, setPossibleMoveLayout] = useState(
        initailPossibleLayout
    );
    const [selectedPiece, setSelectedPiece] = useState({
        piece: "",
        pos_x: -1,
        pos_y: -1,
    });

    useEffect(() => {
        const ws = new WebSocket("ws://localhost:8080");
        setSocket(ws);

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("Message from server:", data);
            if (data.message == "Game already in progress") {
                setIsLoading(true);
            }
            if (data.type === "NEW_GAME") {
                setLayout(data.layout);
                setMyTurn(data.turn === player);
                setMoveHistory([]);
                setGameEnded(false);
                setIsLoading(false);
            }
            if (data.type === "NEW_GAME" && !player) {
                setPlayer(data.player);
                setPlayer(data.player);
                setMyTurn(data.turn === player);
                setGameEnded(false);
                setIsLoading(false);
            }
            if (data.type === "GAME_STATE_UPDATE") {
                setLayout(data.layout);
                setMyTurn(data.turn === player);
                setMoveHistory(data.moveHistory);
                setIsLoading(false);
            }

            if (data.type === "GAME_STATE_UPDATE" && !player) {
                setPlayer(data.player);
                setMyTurn(data.turn === data.player);
                setMoveHistory(data.moveHistory);
                setIsLoading(false);
            }

            if (data.type === "GAME_OVER" && data.result) {
                if (data.result === player) {
                    setIsVictory(true);
                } else {
                    setIsVictory(false);
                }
                setIsResultModalOpen(true);
                setGameEnded(true);
            }

            if (data.type === "INVALID_MOVE" && player) {
                setShowErrorNotification(true);
            }
        };

        return () => ws.close();
    }, [player]);

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
        <div className="w-fit h-fit flex flex-col gap-2">
            <div className="h-[10vh]">
                {showErrorNotification && (
                    <ErrorNotification
                        setShowErrorNotification={setShowErrorNotification}
                    />
                )}
            </div>
            player = {myTurn ? "Your Turn" : "Waiting for opponent"},{ }
            {layout.map((row, rowIndex) => (
                <div key={rowIndex} className="w-full h-full flex gap-2 justify-center">
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
                                } ${myTurn && player ==cell[0]  ? "text-green-400" :""} `}
                            onClick={selectPiece}
                        >
                            {cell !== "*" ? cell : ""}
                        </div>
                    ))}
                </div>
            ))}
            <div className="w-full justify-center gap-4 text-center">
                {selectedPiece.piece && (
                    <div>Selected Piece = {selectedPiece.piece}</div>
                )}
                <div className="flex w-full justify-center gap-4 py-2">
                    {renderPossibleMoveButtons()}
                </div>
            </div>
            {moveHistory && renderMoveHistory()}
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
                            })
                        );
                    }}
                >
                    New Game
                </button>
            )}
        </div>
    );
};

export default GameLayout;
