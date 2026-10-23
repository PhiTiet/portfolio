import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTERS, COMPACT_CHAPTERS, COMPACT_DURATION, DURATION, RECOMMENDATION_INTERVAL, RECOMMENDATIONS_DURATION, architectureLevelAt, chapterAt, createChapters, shouldAutoplay } from '../../main/frontend/architecture-opening.js';

test('both story timelines have the same contiguous chapters, with a shorter compact version', () => {
    for (const [chapters, duration] of [[CHAPTERS, DURATION], [COMPACT_CHAPTERS, COMPACT_DURATION]]) {
        assert.deepEqual(chapters.map(chapter => chapter.id), ['recommendations', 'experience', 'architecture', 'stack', 'ai', 'hire']);
        chapters.forEach((chapter, index) => {
            assert.ok(chapter.duration > 0);
            assert.equal(chapterAt(chapter.start, chapters), index);
            assert.equal(chapterAt(chapter.start + chapter.duration - 1, chapters), index);
            assert.equal(chapter.start + chapter.duration, chapters[index + 1]?.start ?? duration);
        });
    }
    assert.ok(COMPACT_DURATION < DURATION);
});

test('the recommendation sequence gives every author a full-stage turn', () => {
    for (const compact of [false, true]) {
        const chapters = createChapters(compact);
        assert.equal(chapters[0].duration, RECOMMENDATIONS_DURATION);
        assert.equal(createChapters(compact, 7)[0].duration, 7 * RECOMMENDATION_INTERVAL);
    }
});

test('the architecture camera progresses down through all four C4 levels', () => {
    const duration = CHAPTERS.find(chapter => chapter.id === 'architecture').duration;
    assert.deepEqual([0, 0.25, 0.4, 0.7, 0.95].map(progress => architectureLevelAt(duration * progress)), [0, 0, 1, 2, 3]);
});

test('the opening never automatically interrupts reduced motion, repeat visits, reloads, or deep links', () => {
    const firstVisit = { reducedMotion: false, seen: false, hash: '', navigationType: 'navigate' };
    assert.equal(shouldAutoplay(firstVisit), true);
    for (const override of [{ reducedMotion: true }, { seen: true }, { hash: '#projects' }, { navigationType: 'reload' }, { navigationType: 'back_forward' }]) {
        assert.equal(shouldAutoplay({ ...firstVisit, ...override }), false);
    }
});
