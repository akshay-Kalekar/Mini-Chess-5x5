const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });
let playerAPiece = 5;
let playerBPiece = 5;


let initialState = {
  layout: [
    ["A-P1", "A-P2", "A-P3", "A-H1", "A-H2"],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["B-P1", "B-P2", "B-P3", "B-H1", "B-H2"]
  ],
  turn: 'A',
  result: '',
  possibleMoves:[],
  moveHistory:[]
};

let gameState = { ...initialState };

let players = [];

const piecesData = {
  'P': {
    'U': [-1, 0],
    'D': [+1, 0],
    'R': [0, +1],
    'L': [0, -1],
},
'H1': {
    'U': [-2, 0],
    'D': [+2, 0],
    'R': [0, +2],
    'L': [0, -2],
},
'H2': {
    'BL': [+2, -2],
    'BR': [+2, +2],
    'FL': [-2, -2],
    'FR': [-2, +2],
}
};

const validMoves = (piece, check_x, check_y, layout, selectedPiece, myTurn) => {
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
          playerAPiece -= 1;
          if (playerAPiece === 0) {
            gameState.result = 'B';
          }
          return {valid :true, movement:direction};
        } else if (gameState.turn === 'A' && layout[pos_x][pos_y].slice(0, 1) == 'B') {
          playerBPiece -= 1;
          if (playerBPiece === 0) {
              gameState.result = 'A';
          }
          console.log("game result",gameState.result)
          return {valid :true, movement:direction};
        }
        return {valid :true, movement:`${direction}`};
      }

      if (layout[pos_x][pos_y] === "" || (myTurn && layout[pos_x][pos_y].slice(0, 1) === 'B') || (!myTurn && layout[pos_x][pos_y].slice(0, 1) === 'A')) {
        layout[pos_x][pos_y]="*";
      }
    }
  }
  gameState.layout =layout
  return {valid :false, movement:""};
};

const startNewGame = () => {
  const deepCopy = obj => JSON.parse(JSON.stringify(obj));
  gameState = deepCopy(initialState);
  playerAPiece = 5;
  playerBPiece = 5;
  gameState.moveHistory = [];
  broadcast({
    type: 'NEW_GAME',
    layout: gameState.layout,
    turn: gameState.turn,
    result: "",
    moveHistory:gameState.moveHistory,
  });
};

wss.on('connection', (ws) => {
  if (players.length >= 2) {
    ws.send(JSON.stringify({ type: 'ERROR', message: 'Game already in progress' }));
    ws.close();
    return;
  }

  const player = players.length === 0 ? 'A' : 'B';
  players.push({ ws, player });

  ws.send(JSON.stringify({
    type: 'GAME_STATE_UPDATE',
    layout: gameState.layout,
    turn: gameState.turn,
    result: gameState.result,
    player,
  }));

  ws.on('message', (message) => {
    const event = JSON.parse(message);
    console.log('Received:', event);
    if(event.type === 'RESIGN'){
      gameState.result = event.result
      gameState.moveHistory = []; 
      broadcast({
        type: 'GAME_OVER',
        result: gameState.result,
        moveHistory:gameState.moveHistory
      });
    }
    if (event.type === 'PLAYER_MOVE') {
      const { piece, pos_x, pos_y, layout, myTurn, selectedPiece } = event;
      if (gameState.turn !== player) {
        ws.send(JSON.stringify({
          type: 'INVALID_MOVE',
          message: 'Not your turn',
        }));
        return;
      }

      const x = parseInt(pos_x);
      const y = parseInt(pos_y);

      const isValid = validMoves(piece, x, y, layout, selectedPiece, myTurn);
      
      if (isValid.valid) {
        let move = selectedPiece.piece + ' : ' + isValid.movement
        gameState.moveHistory.push(move)
        let newLayout = [...layout];
        newLayout[selectedPiece.pos_x][selectedPiece.pos_y] = "";
        newLayout[x][y] = piece;

        // Switch turns
        const newTurn = gameState.turn === 'A' ? 'B' : 'A';

        gameState.layout = newLayout;
        gameState.turn = newTurn;
        if (gameState.result) {
          broadcast({
            type: 'GAME_OVER',
            result: gameState.result,
            moveHistory:gameState.moveHistory,
            turn:gameState.turn,
          });
        } else {
          broadcast({
            type: 'GAME_STATE_UPDATE',
            layout: gameState.layout,
            turn: gameState.turn,
            result: gameState.result,
            moveHistory:gameState.moveHistory
          });
        }
      } else {
        ws.send(JSON.stringify({
          type: 'INVALID_MOVE',
          message: 'Invalid move, please try again.',
        }));
      }
    } else if (event.type === 'NEW_GAME') {
      startNewGame();
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    players = players.filter(p => p.ws !== ws);
  });
});

const broadcast = (data) => {
  players.forEach(({ ws }) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  });
};

console.log('WebSocket server running on ws://localhost:8080');
