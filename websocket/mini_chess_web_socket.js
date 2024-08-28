const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

let rooms = {};

const piecesData = {
  'P': { 'U': [-1, 0], 'D': [+1, 0], 'R': [0, +1], 'L': [0, -1] },
  'H1': { 'U': [-2, 0], 'D': [+2, 0], 'R': [0, +2], 'L': [0, -2] },
  'H2': { 'BL': [+2, -2], 'BR': [+2, +2], 'FL': [-2, -2], 'FR': [-2, +2] }
};

const initialGameState = () => ({
  layout: [
    ["A-P1", "A-P2", "A-P3", "A-H1", "A-H2"],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["B-P1", "B-P2", "B-P3", "B-H1", "B-H2"]
  ],
  turn: 'A',
  result: '',
  possibleMoves: [],
  moveHistory: [],
  playerAPiece: 5,
  playerBPiece: 5,
});

const validMoves = (piece, check_x, check_y, layout, selectedPiece, myTurn, gameState) => {
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

const startNewGame = (roomCode) => {
  if (rooms[roomCode]) {
    rooms[roomCode].gameState = initialGameState();
    broadcastToRoom(roomCode, {
      type: 'NEW_GAME',
      layout: rooms[roomCode].gameState.layout,
      turn: rooms[roomCode].gameState.turn,
      result: "",
      moveHistory: rooms[roomCode].gameState.moveHistory,
    });
  }
};

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const event = JSON.parse(message);
    console.log('Received:', event);

    if (event.type === 'CREATE_ROOM') {
      const roomCode = event.roomCode;
      if (rooms[roomCode]) {
        ws.send(JSON.stringify({ type: 'ERROR', message: 'Room code already exists' }));
      } else {
        rooms[roomCode] = {
          players: [{ ws, player: 'A' }],
          gameState: initialGameState()
        };
        ws.send(JSON.stringify({
          type: 'ROOM_CREATED',
          roomCode,
          player: 'A',
          layout: rooms[roomCode].gameState.layout,
          turn: rooms[roomCode].gameState.turn,
          result: rooms[roomCode].gameState.result,
        }));
      }
    } else if (event.type === 'JOIN_ROOM') {
      const roomCode = event.roomCode;
      if (!rooms[roomCode]) {
        ws.send(JSON.stringify({ type: 'ERROR', message: 'Room code does not exist' }));
      } else if (rooms[roomCode].players.length >= 2) {
        ws.send(JSON.stringify({ type: 'ERROR', message: 'Room is full' }));
      } else {
        const player = 'B';
        rooms[roomCode].players.push({ ws, player });
        ws.send(JSON.stringify({
          type: 'ROOM_JOINED',
          roomCode,
          player,
          layout: rooms[roomCode].gameState.layout,
          turn: rooms[roomCode].gameState.turn,
          result: rooms[roomCode].gameState.result,
        }));
        broadcastToRoom(roomCode, {
          type: 'PLAYER_JOINED',
          player,
        });
      }
    } else if (event.type === 'PLAYER_MOVE') {
      const { piece, pos_x, pos_y, layout, myTurn, selectedPiece, roomCode } = event;
      const gameState = rooms[roomCode].gameState;
      const player = rooms[roomCode].players.find(p => p.ws === ws).player;

      if (gameState.turn !== player) {
        ws.send(JSON.stringify({
          type: 'INVALID_MOVE',
          message: 'Not your turn',
        }));
        return;
      }

      const x = parseInt(pos_x);
      const y = parseInt(pos_y);

      const isValid = validMoves(piece, x, y, layout, selectedPiece, myTurn, gameState);

      if (isValid.valid) {
        let move = selectedPiece.piece + ' : ' + isValid.movement;
        gameState.moveHistory.push(move);
        let newLayout = [...layout];
        newLayout[selectedPiece.pos_x][selectedPiece.pos_y] = "";
        newLayout[x][y] = piece;

        // Switch turns
        const newTurn = gameState.turn === 'A' ? 'B' : 'A';

        gameState.layout = newLayout;
        gameState.turn = newTurn;
        if (gameState.result) {
          broadcastToRoom(roomCode, {
            type: 'GAME_OVER',
            result: gameState.result,
            moveHistory: gameState.moveHistory,
            turn: gameState.turn,
          });
        } else {
          broadcastToRoom(roomCode, {
            type: 'GAME_STATE_UPDATE',
            layout: gameState.layout,
            turn: gameState.turn,
            result: gameState.result,
            moveHistory: gameState.moveHistory,
          });
        }
      } else {
        ws.send(JSON.stringify({
          type: 'INVALID_MOVE',
          message: 'Invalid move, please try again.',
        }));
      }
    } else if (event.type === 'NEW_GAME') {
      startNewGame(event.roomCode);
    } else if (event.type === 'RESIGN') {
      const roomCode = event.roomCode;
      const gameState = rooms[roomCode].gameState;
      gameState.result = event.result;
      gameState.moveHistory = [];
      broadcastToRoom(roomCode, {
        type: 'GAME_OVER',
        result: gameState.result,
        moveHistory: gameState.moveHistory
      });
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    Object.keys(rooms).forEach(roomCode => {
      rooms[roomCode].players = rooms[roomCode].players.filter(p => p.ws !== ws);
      if (rooms[roomCode].players.length === 0) {
        delete rooms[roomCode];
      }
    });
  });
});

const broadcastToRoom = (roomCode, data) => {
  rooms[roomCode].players.forEach(({ ws }) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  });
};

console.log('WebSocket server running on ws://localhost:8080');
