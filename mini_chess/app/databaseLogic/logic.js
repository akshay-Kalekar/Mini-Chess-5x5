import {ref,set,get,update} from 'firebase/database'
import {database} from '../firebase/database'
/*

rooms :{
    roomCode :{
        player A :
        player B :
        spectator : [],
        gameState : {
        }
    }
}

const in
*/

export const initialGameState =  {
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
  };
//Create Room on User Request with input roomCode
export const createRoom = async (roomCode)=>{
    const roomRef = ref(database,`rooms/${roomCode}`);

    await set(roomRef,{
        players : {A:true,B:null},
        gameState: initialGameState
    });
    console.log("sERVER SEND DATA" , initialGameState)
};

//Check for user Join to existing room
export const joinRoom = async (roomCode,player)=>{
    const roomRef = ref(database,`rooms/${roomCode}/players`);
    await update(roomRef,{B:true});
}

export const updateGameState = async (roomCode,gameState) =>{
    const gameStateRef = ref(database,`rooms/${roomCode}/gameState`)
    console.log("GAme state -- ",gameState)
    await update(gameStateRef,{
        layout: gameState.layout,
        turn: gameState.turn,
        result: gameState.result,
        possibleMoves: initialGameState.possibleMoves,
        moveHistory: gameState.moveHistory ?? []  ,
        playerAPiece: gameState.playerAPiece,
        playerBPiece: gameState.playerBPiece,
      }

    )
}