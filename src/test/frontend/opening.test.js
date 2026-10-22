import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createOpening, OPENING } from '../../main/frontend/opening.js';

const { initial, moves, snapshots } = createOpening();
const square = (position, id) => snapshots[position].pieces.find(piece => piece.id === id)?.square;

test('the complete legal opening retains stable piece identities for seeking and replay', () => {
    assert.deepEqual(moves.map(move => move.san), OPENING);
    assert.equal(snapshots.length, moves.length + 1);
    assert.equal(initial.length, 32);
    assert.equal(square(0, 'wpd2'), 'd2');
    assert.equal(square(moves.length, 'wbf1'), 'd3');
    assert.equal(new Set(snapshots.at(-1).pieces.map(piece => piece.square)).size, 29);
});

test('captures remove the captured pawns without changing the capturing knight identity', () => {
    for (const id of ['wpd2', 'wpc2', 'bpc7']) assert.equal(square(7, id), undefined);
    assert.equal(square(7, 'wnb1'), 'c3');
    assert.equal(snapshots[7].pieces.length, 29);
});

test('castling moves both king and rook to their destination squares', () => {
    const position = moves.findIndex(move => move.san === 'O-O') + 1;
    assert.equal(square(position, 'wke1'), 'g1');
    assert.equal(square(position, 'wrh1'), 'f1');
});
