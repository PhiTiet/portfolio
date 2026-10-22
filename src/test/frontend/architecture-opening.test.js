import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTERS, DURATION, architectureLevelAt, chapterAt, shouldAutoplay } from '../../main/frontend/architecture-opening.js';

test('the engineering story has five contiguous chapters and a bounded duration', () => {
    assert.deepEqual(CHAPTERS.map(chapter => chapter.id), ['architecture', 'stack', 'ai', 'experience', 'hire']);
    CHAPTERS.forEach((chapter, index) => {
        assert.equal(chapterAt(chapter.start), index);
        assert.equal(chapterAt(chapter.start + chapter.duration - 1), index);
        assert.equal(chapter.start + chapter.duration, CHAPTERS[index + 1]?.start ?? DURATION);
    });
    assert.equal(DURATION, 38000);
});

test('the architecture camera progresses down through all four C4 levels', () => {
    assert.equal(architectureLevelAt(0), 0);
    assert.equal(architectureLevelAt(2639), 0);
    assert.equal(architectureLevelAt(2640), 1);
    assert.equal(architectureLevelAt(5610), 2);
    assert.equal(architectureLevelAt(8580), 3);
    assert.equal(architectureLevelAt(11000), 3);
});

test('the opening never automatically interrupts reduced motion, repeat visits, reloads, or deep links', () => {
    const firstVisit = { reducedMotion: false, seen: false, hash: '', navigationType: 'navigate' };
    assert.equal(shouldAutoplay(firstVisit), true);
    for (const override of [{ reducedMotion: true }, { seen: true }, { hash: '#projects' }, { navigationType: 'reload' }, { navigationType: 'back_forward' }]) {
        assert.equal(shouldAutoplay({ ...firstVisit, ...override }), false);
    }
});
