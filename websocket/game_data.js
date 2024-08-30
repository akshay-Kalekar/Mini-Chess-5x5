
export const piecesData = {
    'P': { 'U': [-1, 0], 'D': [+1, 0], 'R': [0, +1], 'L': [0, -1] },
    'H1': { 'U': [-2, 0], 'D': [+2, 0], 'R': [0, +2], 'L': [0, -2] },
    'H2': { 'BL': [+2, -2], 'BR': [+2, +2], 'FL': [-2, -2], 'FR': [-2, +2] }
};


export const initialGameState = () => ({
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
  