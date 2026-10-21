import { Chess } from 'chess.js';

export const OPENING = ['e4', 'c5', 'd4', 'cxd4', 'c3', 'dxc3', 'Nxc3', 'Nc6', 'Nf3', 'e6', 'Bc4', 'a6', 'O-O', 'b5', 'Bd3'];

export function createOpening() {
    const chess = new Chess();
    const initial = chess.board().flat().filter(Boolean).map(piece => ({
        id: piece.color + piece.type + piece.square,
        color: piece.color,
        type: piece.type,
        square: piece.square
    }));
    const squares = new Map(initial.map(piece => [piece.square, piece.id]));
    const snapshot = () => ({ fen: chess.fen(), pieces: [...squares].map(([square, id]) => ({ id, square })) });
    const snapshots = [snapshot()];
    const moves = OPENING.map(san => {
        const move = chess.move(san);
        const id = squares.get(move.from);
        const captureSquare = move.isEnPassant() ? move.to[0] + move.from[1] : move.to;
        const capturedId = move.captured ? squares.get(captureSquare) : null;
        if (capturedId) squares.delete(captureSquare);
        squares.delete(move.from);
        squares.set(move.to, id);
        let rook = null;
        if (move.isKingsideCastle() || move.isQueensideCastle()) {
            const rank = move.color === 'w' ? '1' : '8';
            const from = (move.isKingsideCastle() ? 'h' : 'a') + rank;
            const to = (move.isKingsideCastle() ? 'f' : 'd') + rank;
            rook = { id: squares.get(from), from, to };
            squares.delete(from);
            squares.set(to, rook.id);
        }
        snapshots.push(snapshot());
        return { ...move, id, capturedId, rook };
    });
    return { initial, moves, snapshots };
}

export function squarePosition(square) {
    const file = square.charCodeAt(0) - 97;
    const rank = Number(square[1]);
    return { x: (3.5 - file) * 0.0625, z: (rank - 4.5) * 0.0625 };
}
