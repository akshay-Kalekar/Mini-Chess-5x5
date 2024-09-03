import React, { useState, useEffect } from "react";
import { validMoves, possibleMoves, piecesData } from "../components/utils";
import ErrorNotification from "../components/ErrorNotification";
import { useSearchParams, useRouter } from "next/navigation";
import { ref, onValue } from "firebase/database";
import { createRoom, joinRoom, updateGameState } from "@/app/databaseLogic/logic";
import { database } from "@/app/firebase/database";

export const GameLayoutFirebase = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const type = searchParams.get('type');
    const roomCode = searchParams.get('roomCode');

    const initialLayout = [
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
    ];

    const [isError, setIsError] = useState(false);
    const [error, setError] = useState("");
    const [isResultModalOpen, setIsResultModalOpen] = useState(false);
    const [showErrorNotification, setShowErrorNotification] = useState(false);
    const [isVictory, setIsVictory] = useState(null);
    const [gameEnded, setGameEnded] = useState(false);
    const [player, setPlayer] = useState(null);
    const [myTurn, setMyTurn] = useState(false);
    const [layout, setLayout] = useState(initialLayout);
    const [moveHistory, setMoveHistory] = useState([]);
    const [possibleMoveLayout, setPossibleMoveLayout] = useState(initialLayout);
    const [selectedPiece, setSelectedPiece] = useState({
        piece: "",
        pos_x: -1,
        pos_y: -1,
    });
    const [gameState, setGameState] = useState({
        layout: initialLayout,
        turn: 'A',
        result: "",
        possibleMoves: possibleMoveLayout,
        moveHistory: [],
        playerAPiece: 5,
        playerBPiece: 5
    });

    useEffect(() => {
        if (roomCode && type === "CREATE_ROOM") {
            createRoom(roomCode); // Initialize game layout
        } else if (roomCode && type === "JOIN_ROOM") {
            joinRoom(roomCode); // Player joining
        }

        const incomingDataRef = ref(database, `rooms/${roomCode}`);
        const unsubscribe = onValue(incomingDataRef, (snapshot) => {
            const data = snapshot.val();
            console.log("Incoming Data from Server", data);
            if (!data?.gameState?.layout) return;

            setGameState(data.gameState);

            if (type === 'CREATE_ROOM' && !player) {
                setPlayer('A');
            } else if (type === 'JOIN_ROOM' && !player) {
                setPlayer('B');
            }

            setLayout(data.gameState.layout);
            setMyTurn(data.gameState.turn === player);
            setMoveHistory(data.gameState.moveHistory);

            if (type != 'SPECTATOR_ROOM' && data.gameState.result) {
                setIsVictory(data.gameState.result === player);
                setIsResultModalOpen(true);
                setGameEnded(true);
            }
        });

        return () => unsubscribe();
    }, [roomCode, type, player]);

    const selectPiece = (e) => {
        const piece = e.target.textContent;

        if (
            (selectedPiece.piece === "" &&
                myTurn &&
                ((player === "A" && piece.startsWith("A")) ||
                    (player === "B" && piece.startsWith("B")))) ||
            (piece !== "" &&
                myTurn &&
                piece.startsWith(player) &&
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
            const gameS = { ...gameState };
            const isValidMove = validMoves(selectedPiece.piece, x, y, layout, selectedPiece, myTurn, gameS, piecesData);

            if (isValidMove.valid) {
                const newLayout = [...layout];
                newLayout[selectedPiece.pos_x][selectedPiece.pos_y] = "";
                newLayout[x][y] = selectedPiece.piece;
                setLayout(newLayout);

                const nextTurn = player === 'A' ? 'B' : 'A';

                updateGameState(roomCode, {
                    layout: newLayout,
                    turn: nextTurn,
                    result: gameS.result,
                    moveHistory: gameS.moveHistory,
                    playerAPiece: gameS.playerAPiece,
                    playerBPiece: gameS.playerBPiece
                });

                setGameState({ ...gameS, layout: newLayout, turn: nextTurn });
            } else {
                setError("Invalid Move");
                setShowErrorNotification(true);
            }

            setSelectedPiece({ piece: "", pos_x: -1, pos_y: -1 });
            setPossibleMoveLayout(initialLayout);
        }
    };

    const handleMoveClick = (direction) => {
        if (!selectedPiece.piece) return;
        const piece = selectedPiece.piece;
        let moves = [];

        if (piece.slice(-2, -1) === "P") {
            moves = piecesData["P"];
        } else if (piece.slice(-2, -1) === "H") {
            moves = piecesData[piece.slice(-2)];
        }

        const move = moves[direction];

        if (move) {
            const newPosX = parseInt(selectedPiece.pos_x) + move[0];
            const newPosY = parseInt(selectedPiece.pos_y) + move[1];

            const newLayout = [...layout];
            newLayout[selectedPiece.pos_x][selectedPiece.pos_y] = "";
            newLayout[newPosX][newPosY] = selectedPiece.piece;
            setLayout(newLayout);
            setSelectedPiece({ piece: "", pos_x: -1, pos_y: -1 });
            setPossibleMoveLayout(initialLayout);
        }
    };

    const renderMoveHistory = () => {
        const lastMoves = moveHistory.length > 10 ? moveHistory.slice(-10) : moveHistory;
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
            if (piece.slice(-2, -1) === "P") {
                moves = piecesData["P"];
            } else if (piece.slice(-2, -1) === "H") {
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

    if (isError)
        return (
            <div className="h-[100vh] text-center flex flex-col justify-center align-middle items-center gap-8">
                <div className="text-5xl"> Do a double check</div>
                <div>{error}</div>
                <button className="btn btn-error w-1/12" onClick={() => router.back()}>Back</button>
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
                                    createRoom(roomCode)
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
                    createRoom(roomCode)
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
                    createRoom(roomCode)
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
