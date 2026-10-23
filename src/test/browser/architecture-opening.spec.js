import { test, expect } from '@playwright/test';
import { openPortfolio, expectAccessible, expectPortfolioReady } from './helpers.js';
import { CHAPTERS, RECOMMENDATION_INTERVAL } from '../../main/frontend/architecture-opening.js';

test('static story exposes every chapter accessibly', { tag: '@layout' }, async ({ page }, testInfo) => {
    await openPortfolio(page, testInfo, { seen: false });
    const dialog = page.locator('.architecture-intro');
    const replay = page.locator('[data-intro-replay]');
    await expect(dialog).not.toBeVisible();
    await replay.click();
    await expect(dialog).toHaveAttribute('data-chapter', 'hire');
    await expect(page.locator('[data-intro-pause]')).not.toBeVisible();
    for (const [index, chapter] of ['recommendations', 'experience', 'architecture', 'stack', 'ai', 'hire'].entries()) {
        await page.locator(`[data-intro-chapter="${index}"]`).click();
        await expect(page.locator(`[data-intro-act="${chapter}"]`)).toBeVisible();
        if (chapter === 'recommendations') {
            await expect(page.locator('.intro-quote figcaption strong')).toHaveText(['Pieter Bijl', 'Jeroen Dee', 'Rachid El Kaddouri', 'Rob Smorenburg', 'Armend Hoxha']);
            for (const quote of await page.locator('.intro-quote').all()) await expect(quote).toBeVisible();
            const originals = await page.locator('.recommendation-card .quote-text').allTextContents();
            const excerpts = await page.locator('.intro-quote blockquote').allTextContents();
            excerpts.forEach((excerpt, index) => expect(originals[index]).toContain(excerpt));
        }
        if (chapter === 'architecture') await expect(page.locator('.intro-credential')).toHaveText(testInfo.project.metadata.language === 'nl' ? 'BSc Informatica' : 'BSc Computer Science');
        if (chapter === 'experience') {
            await expect(page.locator('.target-roles li')).toHaveText(['Senior Software Engineer']);
            await expect(page.locator('.experience-track li').first().locator('h4')).toHaveText('Ahold Delhaize');
            const education = page.locator('.experience-education');
            await expect(education.locator('h4')).toHaveText(testInfo.project.metadata.language === 'nl' ? 'BSc Informatica' : 'BSc Computer Science');
            await expect(education.locator('p')).toHaveText('Vrije Universiteit Amsterdam');
            await expect(education.locator('.career-year')).toHaveText('2021');
        }
        expect(await dialog.evaluate(element => element.scrollWidth - element.clientWidth)).toBe(0);
        expect(await dialog.evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0);
        await expectAccessible(page);
    }
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(replay).toBeFocused();
});

test('the introduction does not wait for the external icon kit', async ({ page }, testInfo) => {
    let iconRequest;
    await page.route('https://kit.fontawesome.com/**', route => { iconRequest = route; });
    try {
        await openPortfolio(page, testInfo, { animated: true, seen: false });
        await expect.poll(() => Boolean(iconRequest)).toBe(true);
        await expect(page.locator('.architecture-intro')).toBeVisible();
    } finally {
        await iconRequest?.abort();
    }
});

test('every recommendation takes over the full stage with readable attribution', { tag: '@layout' }, async ({ page }, testInfo) => {
    await openPortfolio(page, testInfo, { animated: true, seen: false });
    await page.locator('.intro-progress > span').evaluate(element => element.getAnimations()[0].pause());
    for (const [index, author] of ['Pieter Bijl', 'Jeroen Dee', 'Rachid El Kaddouri', 'Rob Smorenburg', 'Armend Hoxha'].entries()) {
        await page.locator('.intro-progress > span').evaluate((element, time) => { element.getAnimations()[0].currentTime = time; }, index * RECOMMENDATION_INTERVAL + 900);
        const quote = page.locator('.intro-quote[data-current]');
        await expect(quote.locator('figcaption strong')).toHaveText(author);
        await expect(quote.locator('blockquote')).toHaveCSS('opacity', '1');
        await expect(page.locator('.intro-quote:visible')).toHaveCount(1);
        const bounds = await quote.boundingBox();
        const viewport = await page.locator('.intro-viewport').boundingBox();
        const header = await page.locator('.intro-header').boundingBox();
        const footer = await page.locator('.intro-footer').boundingBox();
        expect(bounds.width).toBeGreaterThan(viewport.width * 0.9);
        expect(bounds.height).toBeGreaterThan(viewport.height * 0.5);
        expect(bounds.y).toBeGreaterThanOrEqual(header.y + header.height);
        expect(bounds.y + bounds.height).toBeLessThanOrEqual(footer.y);
        const caption = await quote.locator('figcaption').boundingBox();
        expect(caption.y + caption.height).toBeLessThanOrEqual(bounds.y + bounds.height);
    }
    await page.locator('[data-intro-pause]').click();
    await expect(page.locator('.architecture-intro')).toHaveAttribute('data-chapter', 'recommendations');
    await expectAccessible(page);
});

test('the paused experience timeline supports keyboard scrolling', async ({ page }, testInfo) => {
    await openPortfolio(page, testInfo, { animated: true, seen: false });
    await page.locator('.intro-progress > span').evaluate(element => element.getAnimations()[0].pause());
    await page.locator('[data-intro-chapter="1"]').click();
    await page.locator('[data-intro-pause]').click();
    const timeline = page.locator('.experience-window');
    await timeline.focus();
    await expect(timeline).toBeFocused();
    await page.keyboard.press('End');
    await expect.poll(() => timeline.evaluate(element => element.scrollTop)).toBeGreaterThan(0);
    await page.keyboard.press('Home');
    await expect.poll(() => timeline.evaluate(element => element.scrollTop)).toBe(0);
    await expectAccessible(page);
});

test('full-stage recommendations pause for reading and support direct selection', { tag: '@layout' }, async ({ page }, testInfo) => {
    await openPortfolio(page, testInfo, { animated: true, seen: false });
    await page.locator('.intro-quote-window').focus();
    await expect(page.locator('.architecture-intro')).toHaveAttribute('data-playing', 'false');
    for (const index of [3, 0, 4, 1]) await page.locator(`[data-intro-quote-button="${index}"]`).click();
    await expect(page.locator('.intro-quote:visible')).toHaveCount(1);
    await expect(page.locator('.intro-quote[data-current] figcaption strong')).toHaveText('Jeroen Dee');
    await expect(page.locator('[data-intro-quote-button="1"]')).toHaveAttribute('aria-current', 'true');
    await page.locator('[data-intro-pause]').click();
    await expect(page.locator('.architecture-intro')).toHaveAttribute('data-playing', 'true');
    for (const index of [4, 0, 2]) await page.locator(`[data-intro-quote-button="${index}"]`).click();
    await expect(page.locator('.intro-quote[data-current] figcaption strong')).toHaveText('Rachid El Kaddouri');
    await expect(page.locator('.intro-quote:visible')).toHaveCount(1);
});

test('first visit supports pause, seeking, skip, and replay without trapping focus', async ({ page }, testInfo) => {
    await openPortfolio(page, testInfo, { animated: true, seen: false });
    const dialog = page.locator('.architecture-intro');
    const pause = page.locator('[data-intro-pause]');
    const state = () => page.locator('.intro-progress > span').evaluate(element => element.getAnimations()[0].playState);
    await expect(dialog).toBeVisible();
    await expect(page.locator('[data-intro-close]')).toBeFocused();
    await pause.click();
    await expect.poll(state).toBe('paused');
    await page.locator('[data-intro-chapter="3"]').click();
    await expect(page.locator('.stack-composition')).toBeVisible();
    await pause.click();
    await expect.poll(state).toBe('running');
    await page.locator('[data-intro-close]').click();
    await expect(dialog).not.toBeVisible();
    await expect(page.locator('.hero h1')).toBeFocused();
    await page.reload({ waitUntil: 'commit' });
    await expectPortfolioReady(page);
    await expect(dialog).not.toBeVisible();
    await page.locator('[data-intro-replay]').click();
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
});

test('language badges become stationary cards without stretching their lettering', async ({ page }, testInfo) => {
    await openPortfolio(page, testInfo, { animated: true, seen: false });
    await page.locator('[data-intro-chapter="2"]').click();
    const tiles = page.locator('.intro-portal .intro-morph');
    await expect(tiles).toHaveCount(2, { timeout: 10000 });
    await page.locator('[data-intro-pause]').click();
    await expect(page.locator('.stack-act')).toHaveCSS('transform', 'none');
    for (const language of ['java', 'kotlin']) {
        const tile = page.locator(`.intro-portal .intro-morph[data-shared="${language}"]`);
        await expect(tile).toBeVisible();
        const scale = await tile.locator('span').evaluate(label => {
            const matrix = new DOMMatrix(getComputedStyle(label).transform);
            return [matrix.a, matrix.d];
        });
        expect(scale).toEqual([1, 1]);
    }
    await page.locator('[data-intro-pause]').click();
    await expect(tiles).toHaveCount(0);
    await expect(page.locator('.java-tile')).toHaveCSS('opacity', '1');
    await expect(page.locator('.kotlin-tile')).toHaveCSS('opacity', '1');
    for (const language of ['java', 'kotlin']) {
        const card = page.locator(`.${language}-tile`);
        await expect(card).toHaveText(language === 'java' ? 'Java' : 'Kotlin');
        const offsets = await card.evaluate(element => {
            const tile = element.getBoundingClientRect();
            const label = element.querySelector('strong').getBoundingClientRect();
            return [Math.abs(label.x + label.width / 2 - tile.x - tile.width / 2), Math.abs(label.y + label.height / 2 - tile.y - tile.height / 2)];
        });
        for (const offset of offsets) expect(offset).toBeLessThan(1);
    }
});

test('people-first chapters carry a shared thread into architecture', async ({ page }, testInfo) => {
    await openPortfolio(page, testInfo, { animated: true, seen: false });
    await expect(page.locator('.architecture-intro')).toHaveAttribute('data-chapter', 'recommendations');
    const thread = page.locator('.intro-thread-morph');
    for (const [index, chapter] of [[1, 'experience'], [2, 'architecture']]) {
        await page.locator(`[data-intro-chapter="${index}"]`).click();
        await expect(page.locator('.architecture-intro')).toHaveAttribute('data-chapter', chapter);
        await expect(thread).toBeVisible();
        await expect(thread).toHaveAttribute('aria-hidden', 'true');
        await expect(thread).toHaveCount(0);
    }
});

test('technical highlights remain alive late in each chapter and pause cleanly', async ({ page }, testInfo) => {
    await openPortfolio(page, testInfo, { animated: true, seen: false });
    for (const [id, time, selector, property] of [
        ['architecture', 7000, '.code-return', 'backgroundColor'],
        ['stack', 3400, '.stack-lane .intro-energy', 'opacity'],
        ['ai', 3400, '.verification-gate', 'color']
    ]) {
        const index = CHAPTERS.findIndex(chapter => chapter.id === id);
        await page.locator(`[data-intro-chapter="${index}"]`).click();
        await page.evaluate(({ id, time, start }) => {
            const clock = document.querySelector('.intro-progress > span').getAnimations()[0];
            clock.pause();
            clock.currentTime = start + time;
            document.querySelector(`[data-intro-act="${id}"]`).getAnimations({ subtree: true }).forEach(effect => { effect.currentTime = time; });
        }, { id, time, start: CHAPTERS[index].start });
        const highlight = page.locator(selector).first();
        const value = () => highlight.evaluate((element, property) => getComputedStyle(element)[property], property);
        const before = await value();
        await expect.poll(value, { intervals: [50] }).not.toBe(before);
        await page.locator('[data-intro-pause]').click();
        await page.locator(`[data-intro-act="${id}"]`).evaluate(async panel => {
            await Promise.all(panel.getAnimations({ subtree: true }).map(effect => effect.ready));
        });
        const paused = await value();
        await page.waitForTimeout(150);
        expect(await value()).toBe(paused);
        await page.locator('[data-intro-pause]').click();
    }
});

test('the explicit portfolio entrance reveals the real page with a curtain sweep', async ({ page }, testInfo) => {
    await openPortfolio(page, testInfo, { animated: true, seen: false });
    await page.locator('[data-intro-chapter="5"]').click();
    await expect(page.locator('.hero-final')).toHaveCSS('opacity', '1');
    await expect(page.locator('.hero-final .hero-actions')).toHaveCSS('opacity', '1');
    await expectAccessible(page);
    await page.locator('[data-intro-enter]').click();
    await expect.poll(() => page.locator('.architecture-intro').evaluate(dialog => getComputedStyle(dialog).clipPath)).not.toBe('none');
    await expect(page.locator('.architecture-intro')).not.toBeVisible();
    await expect(page.locator('.hero h1')).toBeFocused();
});

test('AI clears before the portrait reveal without palette changes or overlapping screens', { tag: '@layout' }, async ({ page }, testInfo) => {
    await openPortfolio(page, testInfo, { animated: true, seen: false });
    await page.locator('[data-intro-chapter="4"]').click();
    await expect(page.locator('.ai-act')).toHaveCSS('opacity', '1');
    const color = await page.locator('.ai-act .intro-lede').evaluate(element => getComputedStyle(element).color);
    await page.locator('[data-intro-chapter="5"]').click();
    await page.locator('[data-intro-pause]').click();
    await expect(page.locator('.intro-arrival-bridge')).toHaveCount(1);
    for (const time of [160, 400, 700, 1100]) {
        await page.locator('.architecture-intro').evaluate((dialog, time) => {
            const clock = dialog.querySelector('.intro-progress > span');
            dialog.getAnimations({ subtree: true }).filter(effect => effect.effect.target !== clock).forEach(effect => { effect.currentTime = time; });
        }, time);
        const opacities = await page.evaluate(() => ['.ai-act', '.hero-final'].map(selector => Number(getComputedStyle(document.querySelector(selector)).opacity)));
        expect(opacities[0] > 0.1 && opacities[1] > 0.1).toBe(false);
        await expect(page.locator('.ai-act .intro-lede')).toHaveCSS('color', color);
    }
    await page.locator('[data-intro-pause]').click();
    await expect(page.locator('.ai-act')).not.toBeVisible();
    await expect(page.locator('.hero-final')).toHaveCSS('opacity', '1');
    await expect(page.locator('.intro-arrival-bridge')).toHaveCount(0);
});

test('recommendation excerpts link to the full recommendations', async ({ page }, testInfo) => {
    await openPortfolio(page, testInfo);
    await page.locator('[data-intro-replay]').click();
    await page.locator('[data-intro-chapter="0"]').click();
    await page.locator('[data-intro-destination="recommendations"]').click();
    await expect(page.locator('.architecture-intro')).not.toBeVisible();
    await expect(page).toHaveURL(/#recommendations$/);
    await expect(page.locator('#recommendations-heading')).toBeInViewport();
});

test('final frame hands off to the hero without a layout jump or leftover animations', { tag: '@layout' }, async ({ page }, testInfo) => {
    await openPortfolio(page, testInfo, { animated: true, seen: false });
    await page.locator('[data-intro-chapter="4"]').click();
    await page.locator('[data-intro-chapter="5"]').click();
    expect(await page.locator('.intro-portal .intro-morph').count()).toBe(0);
    const frames = await page.locator('.hero-final').evaluate(panel => panel.getAnimations().flatMap(animation => animation.effect.getKeyframes()));
    expect(frames.every(frame => !frame.transform || frame.transform === 'none')).toBe(true);
    const differences = () => page.evaluate(() => {
        return ['.hero-name', '.hero-role', '.portrait img', '.hero-experience', '.hero-description', '.hero-actions'].flatMap(selector => {
            const hero = document.querySelector(`.hero > .container > .hero-layout ${selector}`).getBoundingClientRect();
            const final = document.querySelector(`.hero-final ${selector}`).getBoundingClientRect();
            return ['x', 'y', 'width', 'height'].map(property => Math.abs(hero[property] - final[property]));
        });
    });
    await expect.poll(async () => Math.max(...await differences())).toBeLessThan(0.5);
    await expect(page.locator('.hero-final')).toHaveCSS('opacity', '1');
    if (testInfo.project.use.isMobile) {
        const action = await page.locator('.hero-final .hero-actions a').last().boundingBox();
        const footer = await page.locator('.intro-footer').boundingBox();
        expect(action.y + action.height).toBeLessThanOrEqual(footer.y);
    }
    await expect(page.locator('.hero-final .portrait')).toHaveCSS('clip-path', 'none');
    const before = await page.locator('.hero-final .portrait img').boundingBox();
    const dialog = page.locator('.architecture-intro');
    await expect(dialog).not.toBeVisible({ timeout: 9000 });
    const after = await page.locator('.hero > .container .portrait img').boundingBox();
    for (const property of ['x', 'y', 'width', 'height']) expect(Math.abs(before[property] - after[property])).toBeLessThan(0.5);
    expect(await dialog.evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0);
    await expect(page.locator('.hero h1')).toBeFocused();
    expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe('hidden');
});

test('deep links bypass autoplay and reduced motion closes an active story', async ({ page }, testInfo) => {
    await openPortfolio(page, testInfo, { animated: true, seen: false, hash: '#projects' });
    const dialog = page.locator('.architecture-intro');
    await expect(dialog).not.toBeVisible();
    await page.locator('[data-intro-replay]').click();
    await expect(dialog).toBeVisible();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(dialog).not.toBeVisible();
    await expect(page.locator('[data-intro-replay]')).toBeFocused();
});

test('background tabs suspend playback but preserve an explicit pause', async ({ page }, testInfo) => {
    await openPortfolio(page, testInfo, { animated: true, seen: false });
    const state = () => page.locator('.intro-progress > span').evaluate(element => element.getAnimations()[0].playState);
    const visibility = hidden => page.evaluate(value => {
        Object.defineProperty(document, 'hidden', { value, configurable: true });
        document.dispatchEvent(new Event('visibilitychange'));
    }, hidden);
    await visibility(true);
    await expect.poll(state).toBe('paused');
    await visibility(false);
    await expect.poll(state).toBe('running');
    await page.locator('[data-intro-pause]').click();
    await visibility(true);
    await visibility(false);
    await expect.poll(state).toBe('paused');
});

test('hiring action reaches the real contact form', async ({ page }, testInfo) => {
    await openPortfolio(page, testInfo);
    await page.locator('[data-intro-replay]').click();
    await page.locator('[data-intro-destination="contact"]').click();
    await expect(page.locator('.architecture-intro')).not.toBeVisible();
    await expect(page).toHaveURL(/#contact$/);
    await expect(page.locator('#contact-heading')).toBeInViewport();
    await expect(page.locator('#contact-name')).toBeVisible();
});

test('phone playback uses the compact story in portrait and landscape', { tag: '@layout' }, async ({ page }, testInfo) => {
    await openPortfolio(page, testInfo, { animated: true, seen: false });
    const dialog = page.locator('.architecture-intro');
    const mobile = testInfo.project.use.isMobile;
    await expect(dialog).toHaveAttribute('data-motion', mobile ? 'compact' : 'full');
    if (mobile) {
        await expect(page.locator('.intro-quote:visible')).toHaveCount(1);
        await page.locator('[data-intro-pause]').click();
        for (const index of [0, 1, 2, 3, 4]) {
            await page.locator(`[data-intro-chapter="${index}"]`).click();
            if (index === 2) {
                await expect(page.locator('.c4-overview')).toBeVisible();
                await expect(page.locator('.c4-window')).not.toBeVisible();
            }
            const panel = page.locator('.intro-act:visible');
            const bounds = await panel.boundingBox();
            const header = await page.locator('.intro-header').boundingBox();
            const footer = await page.locator('.intro-footer').boundingBox();
            expect(bounds.y).toBeGreaterThanOrEqual(header.y + header.height);
            expect(bounds.y + bounds.height).toBeLessThanOrEqual(footer.y);
            expect(await dialog.evaluate(element => element.scrollWidth - element.clientWidth)).toBe(0);
        }
        await page.locator('[data-intro-chapter="1"]').click();
        await expect(page.locator('.experience-track')).toBeVisible();
        expect(await page.locator('.experience-track').evaluate(element => element.getAnimations().length)).toBe(0);
        await page.locator('.experience-track li').last().scrollIntoViewIfNeeded();
        await expect(page.locator('.experience-track li').last()).toBeInViewport();
        await page.keyboard.press('Escape');
        await page.setViewportSize({ width: 900, height: 500 });
        await page.locator('[data-intro-replay]').click();
        await expect(dialog).toHaveAttribute('data-motion', 'compact');
        await page.locator('[data-intro-pause]').click();
        for (const index of [0, 1, 2, 3, 4]) {
            await page.locator(`[data-intro-chapter="${index}"]`).click();
            const lastContent = page.locator('.intro-act:visible').locator('.intro-quote:visible, .c4-overview li, .stack-lane, .verification-gate, .experience-track li').last();
            await lastContent.scrollIntoViewIfNeeded();
            await expect(lastContent).toBeInViewport();
            await expect(page.locator('[data-intro-close]')).toBeInViewport();
        }
    }
});
