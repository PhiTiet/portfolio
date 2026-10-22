import { test, expect } from '@playwright/test';
import { openPortfolio, expectAccessible } from './helpers.js';

test('static story exposes every chapter accessibly', { tag: '@layout' }, async ({ page }, testInfo) => {
    await openPortfolio(page, testInfo, { seen: false });
    const dialog = page.locator('.architecture-intro');
    const replay = page.locator('[data-intro-replay]');
    await expect(dialog).not.toBeVisible();
    await replay.click();
    await expect(dialog).toHaveAttribute('data-chapter', 'hire');
    await expect(page.locator('[data-intro-pause]')).not.toBeVisible();
    for (const [index, chapter] of ['architecture', 'stack', 'ai', 'experience', 'hire'].entries()) {
        await page.locator(`[data-intro-chapter="${index}"]`).click();
        await expect(page.locator(`[data-intro-act="${chapter}"]`)).toBeVisible();
        if (chapter === 'architecture') await expect(page.locator('.intro-credential')).toHaveText(testInfo.project.metadata.language === 'nl' ? 'BSc Informatica' : 'BSc Computer Science');
        expect(await dialog.evaluate(element => element.scrollWidth - element.clientWidth)).toBe(0);
        expect(await dialog.evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0);
        await expectAccessible(page);
    }
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(replay).toBeFocused();
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
    await page.locator('[data-intro-chapter="1"]').click();
    await expect(page.locator('.stack-composition')).toBeVisible();
    await pause.click();
    await expect.poll(state).toBe('running');
    await page.locator('[data-intro-close]').click();
    await expect(dialog).not.toBeVisible();
    await expect(page.locator('.hero h1')).toBeFocused();
    await page.reload();
    await expect(dialog).not.toBeVisible();
    await page.locator('[data-intro-replay]').click();
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
});

test('final frame hands off to the hero without a layout jump or leftover animations', { tag: '@layout' }, async ({ page }, testInfo) => {
    await openPortfolio(page, testInfo, { animated: true, seen: false });
    await page.locator('[data-intro-chapter="3"]').click();
    await page.locator('[data-intro-chapter="4"]').click();
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
        await expect(page.locator('.c4-overview')).toBeVisible();
        await expect(page.locator('.c4-window')).not.toBeVisible();
        await page.locator('[data-intro-chapter="3"]').click();
        await expect(page.locator('.experience-track')).toBeVisible();
        expect(await page.locator('.experience-track').evaluate(element => element.getAnimations().length)).toBe(0);
        await page.locator('.experience-track li').last().scrollIntoViewIfNeeded();
        await expect(page.locator('.experience-track li').last()).toBeInViewport();
        await page.keyboard.press('Escape');
        await page.setViewportSize({ width: 900, height: 500 });
        await page.locator('[data-intro-replay]').click();
        await expect(dialog).toHaveAttribute('data-motion', 'compact');
    }
});
