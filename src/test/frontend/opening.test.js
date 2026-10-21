import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Chess } from 'chess.js';
import { createOpening, OPENING, squarePosition } from '../../main/frontend/opening.js';

test('the entire Smith-Morra line contains legal moves', () => {
    const { moves, snapshots } = createOpening();
    assert.deepEqual(moves.map(move => move.san), OPENING);
    assert.equal(snapshots.length, 16);
    for (const snapshot of snapshots) assert.equal(new Chess(snapshot.fen).isCheckmate(), false);
});

test('captures remove the actual captured pawns', () => {
    const { moves, snapshots } = createOpening();
    const captures = moves.filter(move => move.capturedId);
    assert.deepEqual(captures.map(move => move.san), ['cxd4', 'dxc3', 'Nxc3']);
    assert.deepEqual(captures.map(move => move.capturedId), ['wpd2', 'wpc2', 'bpc7']);
    assert.equal(snapshots[7].pieces.length, 29);
    assert.equal(snapshots[7].pieces.find(piece => piece.square === 'c3').id, 'wnb1');
});

test('castling moves the king and rook together', () => {
    const { moves, snapshots } = createOpening();
    const index = moves.findIndex(move => move.san === 'O-O');
    assert.deepEqual(moves[index].rook, { id: 'wrh1', from: 'h1', to: 'f1' });
    assert.equal(snapshots[index + 1].pieces.find(piece => piece.id === 'wke1').square, 'g1');
    assert.equal(snapshots[index + 1].pieces.find(piece => piece.id === 'wrh1').square, 'f1');
});

test('snapshots retain stable identities for replay and seeking', () => {
    const { initial, snapshots } = createOpening();
    assert.equal(initial.length, 32);
    assert.equal(snapshots[0].pieces.find(piece => piece.id === 'wpd2').square, 'd2');
    assert.equal(snapshots.at(-1).pieces.find(piece => piece.id === 'wbf1').square, 'd3');
    assert.equal(new Set(snapshots.at(-1).pieces.map(piece => piece.square)).size, 29);
});

test('board coordinates put the queen on d1 and king on e1', () => {
    assert.deepEqual(squarePosition('d1'), { x: 0.03125, z: -0.21875 });
    assert.deepEqual(squarePosition('e1'), { x: -0.03125, z: -0.21875 });
    assert.deepEqual(squarePosition('c5'), { x: 0.09375, z: 0.03125 });
});
