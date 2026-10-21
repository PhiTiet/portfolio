import { test } from 'node:test';
import assert from 'node:assert/strict';
import { boardTransform, pieceArtwork } from '../../main/frontend/chess-scene.js';

test('2D board coordinates orient white at the bottom', () => {
    assert.equal(boardTransform('a8'), 'translate(0%, 0%)');
    assert.equal(boardTransform('h1'), 'translate(700%, 700%)');
    assert.equal(boardTransform('e4'), 'translate(400%, 400%)');
});

test('all twelve cartoon pieces use scalable, self-contained artwork', () => {
    for (const type of ['p', 'r', 'n', 'b', 'q', 'k']) {
        for (const color of ['w', 'b']) {
            const svg = pieceArtwork(type, color);
            assert.match(svg, /viewBox="0 0 48 48"/);
            assert.doesNotMatch(svg, /undefined|https?:|<image/);
        }
    }
});
