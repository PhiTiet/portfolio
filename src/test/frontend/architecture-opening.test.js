import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTERS, COMPACT_CHAPTERS, COMPACT_DURATION, DURATION, HIRE_ENTRY, HIRE_HOLD, RECOMMENDATION_INTERVAL, RECOMMENDATIONS_DURATION, architectureLevelAt, chapterAt, createChapters, shouldAutoplay } from '../../main/frontend/architecture-opening.js';

test('the people-first story has six contiguous chapters and a bounded duration', () => {
    assert.deepEqual(CHAPTERS.map(chapter => chapter.id), ['recommendations', 'experience', 'architecture', 'stack', 'ai', 'hire']);
    CHAPTERS.forEach((chapter, index) => {
        assert.equal(chapterAt(chapter.start), index);
        assert.equal(chapterAt(chapter.start + chapter.duration - 1), index);
        assert.equal(chapter.start + chapter.duration, CHAPTERS[index + 1]?.start ?? DURATION);
    });
    assert.equal(DURATION, 42000);
});

test('the final frame leaves time for an explicit portfolio entrance', () => {
    assert.equal(HIRE_ENTRY, 1400);
    assert.equal(HIRE_HOLD, 2100);
    assert.equal(CHAPTERS.at(-1).duration, HIRE_ENTRY + HIRE_HOLD);
    assert.equal(COMPACT_CHAPTERS.at(-1).duration, HIRE_ENTRY + HIRE_HOLD);
});

test('the compact story keeps all six chapters in a shorter contiguous timeline', () => {
    assert.deepEqual(COMPACT_CHAPTERS.map(chapter => chapter.id), CHAPTERS.map(chapter => chapter.id));
    COMPACT_CHAPTERS.forEach((chapter, index) => {
        assert.equal(chapterAt(chapter.start, COMPACT_CHAPTERS), index);
        assert.equal(chapterAt(chapter.start + chapter.duration - 1, COMPACT_CHAPTERS), index);
        assert.equal(chapter.start + chapter.duration, COMPACT_CHAPTERS[index + 1]?.start ?? COMPACT_DURATION);
    });
    assert.equal(COMPACT_DURATION, 32500);
    assert.ok(COMPACT_DURATION < DURATION);
});

test('the recommendation sequence gives all five authors a full-stage turn in fourteen seconds', () => {
    for (const compact of [false, true]) {
        const chapters = createChapters(compact);
        assert.equal(chapters[0].duration, RECOMMENDATIONS_DURATION);
        assert.equal(RECOMMENDATIONS_DURATION, 14000);
        assert.equal(chapters[1].start, chapters[0].duration);
        assert.equal(createChapters(compact, 7)[0].duration, 7 * RECOMMENDATION_INTERVAL);
    }
});

test('the architecture camera progresses down through all four C4 levels', () => {
    assert.equal(architectureLevelAt(0), 0);
    assert.equal(architectureLevelAt(3419), 0);
    assert.equal(architectureLevelAt(3420), 1);
    assert.equal(architectureLevelAt(5579), 1);
    assert.equal(architectureLevelAt(5580), 2);
    assert.equal(architectureLevelAt(7739), 2);
    assert.equal(architectureLevelAt(7740), 3);
    assert.equal(architectureLevelAt(CHAPTERS.find(chapter => chapter.id === 'architecture').duration), 3);
});

test('the opening never automatically interrupts reduced motion, repeat visits, reloads, or deep links', () => {
    const firstVisit = { reducedMotion: false, seen: false, hash: '', navigationType: 'navigate' };
    assert.equal(shouldAutoplay(firstVisit), true);
    for (const override of [{ reducedMotion: true }, { seen: true }, { hash: '#projects' }, { navigationType: 'reload' }, { navigationType: 'back_forward' }]) {
        assert.equal(shouldAutoplay({ ...firstVisit, ...override }), false);
    }
});
