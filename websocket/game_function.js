import WebSocket, { WebSocketServer } from 'ws';

export const broadcastToRoom = (rooms,roomCode, data) => {
  rooms[roomCode].players.forEach(({ ws }) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  });
};

export const startNewGame = (rooms,roomCode,initialGameState) => {
    if (rooms[roomCode]) {
      rooms[roomCode].gameState = initialGameState();
      broadcastToRoom(rooms,roomCode, {
        type: 'NEW_GAME',
        layout: rooms[roomCode].gameState.layout,
        turn: rooms[roomCode].gameState.turn,
        result: "",
        moveHistory: rooms[roomCode].gameState.moveHistory,
      });
    }
  };

export const validMoves = (piece, check_x, check_y, layout, selectedPiece, myTurn, gameState,piecesData) => {
    let moves;
    if (piece.slice(-2)[0] === 'P') {
      moves = piecesData['P'];
    } else if (piece.slice(-2)[0] === 'H') {
      moves = piecesData[piece.slice(-2)];
    }
  
    let curr_x = Number(selectedPiece["pos_x"]);
    let curr_y = Number(selectedPiece["pos_y"]);
  
    for (let direction in moves) {
      let pos_x = curr_x + moves[direction][0];
      let pos_y = curr_y + moves[direction][1];
  
      if (pos_x >= 0 && pos_x < 5 && pos_y >= 0 && pos_y < 5) {
        if (pos_x === check_x && pos_y === check_y) {
          if (gameState.turn === 'B' && layout[pos_x][pos_y].slice(0, 1) == 'A') {
            gameState.playerAPiece -= 1;
            if (gameState.playerAPiece === 0) {
              gameState.result = 'B';
            }
            return { valid: true, movement: direction };
          } else if (gameState.turn === 'A' && layout[pos_x][pos_y].slice(0, 1) == 'B') {
            gameState.playerBPiece -= 1;
            if (gameState.playerBPiece === 0) {
              gameState.result = 'A';
            }
            return { valid: true, movement: direction };
          }
          return { valid: true, movement: `${direction}` };
        }
  
        if (layout[pos_x][pos_y] === "" || (myTurn && layout[pos_x][pos_y].slice(0, 1) === 'B') || (!myTurn && layout[pos_x][pos_y].slice(0, 1) === 'A')) {
          layout[pos_x][pos_y] = "*";
        }
      }
    }
    gameState.layout = layout;
    return { valid: false, movement: "" };
  };