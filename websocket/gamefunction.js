
export const initialState = 
export const startNewGame = () => {
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