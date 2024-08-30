import http from 'http';
import { validMoves, broadcastToRoom, startNewGame} from './game_function.js';
import { piecesData, initialGameState } from './game_data.js';

import WebSocket, { WebSocketServer } from 'ws';

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/hello') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello, World!');
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});
// Create a WebSocket server instance
const wss = new WebSocketServer({ port: 8080 });
let rooms = {};
wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const event = JSON.parse(message);
    console.log('Received:', event);
    if (event.type === 'SPECTATE_ROOM'){
      const roomCode = event.roomCode;
      if(!rooms[roomCode]){
        ws.send(JSON.stringify({ type: 'ERROR', message: 'Room code does not exist' }));
      }else{
        if(rooms[roomCode].players.length<2){
          ws.send(JSON.stringify({ type: 'ERROR', message: 'Match not started yet' }));
        }
        rooms[roomCode].players.push({ ws, player:'' });

        ws.send(JSON.stringify({
          type: 'SPECTATOR_JOINED',
          roomCode,
          player: '',
          layout: rooms[roomCode].gameState.layout,
          turn: rooms[roomCode].gameState.turn,
          result: rooms[roomCode].gameState.result,
        }));
      }
    }
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
        broadcastToRoom(rooms,roomCode, {
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

      const isValid = validMoves(piece, x, y, layout, selectedPiece, myTurn, gameState,piecesData);

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
          broadcastToRoom(rooms,roomCode, {
            type: 'GAME_OVER',
            result: gameState.result,
            moveHistory: gameState.moveHistory,
            turn: gameState.turn,
          });
        } else {
          broadcastToRoom(rooms,roomCode, {
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
          startNewGame(rooms,event.roomCode,initialGameState);
    } else if (event.type === 'RESIGN') {
          const roomCode = event.roomCode;
          const gameState = rooms[roomCode].gameState;
          gameState.result = event.result;
          gameState.moveHistory = [];
      broadcastToRoom(rooms,roomCode, {
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




server.listen(8000, () => {
  console.log('HTTP and WebSocket server running on http://localhost:8080');
});