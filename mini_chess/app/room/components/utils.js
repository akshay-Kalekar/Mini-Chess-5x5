'use cient'
export const piecesData = {
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
export const possibleMoves = (piece, layout, selectedPiece) => {
    let newLayout = [["","","","",""],["","","","",""],["","","","",""],["","","","",""],["","","","",""]]  
    let moves;
    
    if (piece.slice(-2)[0] === 'P') {
        moves = piecesData['P'];
    } else if (piece.slice(-2)[0] === 'H') {
        moves = piecesData[piece.slice(-2)];
    }

    let curr_x = Number(selectedPiece.pos_x);
    let curr_y = Number(selectedPiece.pos_y);

    for (let direction in moves) {
        let pos_x = curr_x + Number(moves[direction][0]);
        let pos_y = curr_y + Number(moves[direction][1]);
        if (pos_x >= 0 && pos_x < 5 && pos_y >= 0 && pos_y < 5) {
            console.log("possiblilty -- ", pos_x,pos_y);
            console.log("layout ", layout[pos_x][pos_y]);
            if (layout[pos_x][pos_y] === "" || layout[pos_x][pos_y] === "*" ||
                (piece[0]==='A' && layout[pos_x][pos_y][0] === 'B') || 
                (piece[0]==='B' && layout[pos_x][pos_y][0] === 'A')) {
                newLayout[pos_x][pos_y] = '*'; 
            }
        }
    }

    return newLayout;
};

export const validMoves = (piece, check_x, check_y, layout, selectedPiece, myTurn, gameState,piecesData) => {
    let moves;
    console.log("VAlid Moves",gameState)
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
