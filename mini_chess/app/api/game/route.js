import { NextResponse } from 'next/server';

export async function POST(request){
        const data = await request.json();
        const { piece, pos_x, pos_y, layout, myTurn, selectedPiece } = data;

        const piecesData = {
            'P': {
                'L': [-1, 0],
                'R': [+1, 0],
                'U': [0, +1],
                'D': [0, -1],
            },
            'H1': {
                'L': [-2, 0],
                'R': [+2, 0],
                'U': [0, +2],
                'D': [0, -2],
            },
            'H2': {
                'FL': [+2, -2],
                'FR': [+2, +2],
                'BL': [-2, -2],
                'BR': [-2, +2],
            }
        };

        const validMoves = (piece, check_x, check_y) => {
            let moves;
            if (piece.slice(-2)[0] === 'P') {
                moves = piecesData['P'];
            } else if (piece.slice(-2)[0] === 'H') {
                moves = piecesData[piece.slice(-2)];
            }
            let curr_x = Number(selectedPiece["pos_x"]);
            let curr_y = Number(selectedPiece["pos_y"]);
            let possibleMoves = [];

            for (let direction in moves) {
                let pos_x = curr_x + moves[direction][0];
                let pos_y = curr_y + moves[direction][1];

                if (pos_x >= 0 && pos_x < 5 && pos_y >= 0 && pos_y < 5) {
                    if (pos_x === check_x && pos_y === check_y) return true;
                    if (layout[pos_x][pos_y] === "" || (myTurn && layout[pos_x][pos_y].slice(0, 1) === 'B') || (!myTurn && layout[pos_x][pos_y].slice(0, 1) === 'A')) {
                        possibleMoves.push([pos_x, pos_y]);
                    }
                }
            }
            return false;
        };

        const x = parseInt(pos_x);
        const y = parseInt(pos_y);

        const isValid = validMoves(piece, x, y);

        if (isValid) {
            let newLayout = [...layout];
            newLayout[selectedPiece.pos_x][selectedPiece.pos_y] = "";
            newLayout[x][y] = piece;

            // Switch turns
            const newTurn = !myTurn;

            return NextResponse.json({ newLayout, newTurn });
        } else {
            return res.status(400).json({ message: 'Invalid move' });
        }
    } 