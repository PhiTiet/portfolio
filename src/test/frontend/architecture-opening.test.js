import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTERS, COMPACT_CHAPTERS, COMPACT_DURATION, DURATION, HIRE_ENTRY, HIRE_HOLD, architectureLevelAt, chapterAt, shouldAutoplay } from '../../main/frontend/architecture-opening.js';

test('the engineering story has five contiguous chapters and a bounded duration', () => {
    assert.deepEqual(CHAPTERS.map(chapter => chapter.id), ['architecture', 'stack', 'ai', 'experience', 'hire']);
    CHAPTERS.forEach((chapter, index) => {
        assert.equal(chapterAt(chapter.start), index);
        assert.equal(chapterAt(chapter.start + chapter.duration - 1), index);
        assert.equal(chapter.start + chapter.duration, CHAPTERS[index + 1]?.start ?? DURATION);
    });
    assert.equal(DURATION, 34000);
});

test('the final frame has a short entrance and a 1.5-second hold before the hero handoff', () => {
    assert.equal(HIRE_ENTRY, 500);
    assert.equal(HIRE_HOLD, 1500);
    assert.equal(CHAPTERS.at(-1).duration, HIRE_ENTRY + HIRE_HOLD);
    assert.equal(COMPACT_CHAPTERS.at(-1).duration, HIRE_ENTRY + HIRE_HOLD);
});

test('the compact story keeps all five chapters in a shorter contiguous timeline', () => {
    assert.deepEqual(COMPACT_CHAPTERS.map(chapter => chapter.id), CHAPTERS.map(chapter => chapter.id));
    COMPACT_CHAPTERS.forEach((chapter, index) => {
        assert.equal(chapterAt(chapter.start, COMPACT_CHAPTERS), index);
        assert.equal(chapterAt(chapter.start + chapter.duration - 1, COMPACT_CHAPTERS), index);
        assert.equal(chapter.start + chapter.duration, COMPACT_CHAPTERS[index + 1]?.start ?? COMPACT_DURATION);
    });
    assert.equal(COMPACT_DURATION, 22000);
    assert.ok(COMPACT_DURATION < DURATION);
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
