import { test, expect } from '@playwright/test';
import { openPortfolio, expectAccessible, expectPortfolioReady } from './helpers.js';

test('intro chapters are accessible and can be dismissed', { tag: '@layout' }, async ({ page }, testInfo) => {
    await openPortfolio(page, testInfo);
    const dialog = page.locator('.architecture-intro');
    const replay = page.locator('[data-intro-replay]');
    await expect(dialog).not.toBeVisible();
    await expect(replay.locator('small')).toHaveText(/^\d{2}s$/);
    await replay.click();
    for (const [index, chapter] of ['recommendations', 'experience', 'architecture', 'stack', 'ai', 'hire'].entries()) {
        await page.locator(`[data-intro-chapter="${index}"]`).click();
        await expect(page.locator(`[data-intro-act="${chapter}"]`)).toBeVisible();
    }
    await expect(page.locator('[data-intro-pause]')).not.toBeVisible();
    await expectAccessible(page, '.architecture-intro');
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(replay).toBeFocused();
});

test('intro supports pause, quote selection, skip, and replay', async ({ page }, testInfo) => {
    await openPortfolio(page, testInfo, { animated: true, seen: false });
    const dialog = page.locator('.architecture-intro');
    await page.locator('.intro-quote-window').focus();
    await expect(page.locator('[data-intro-pause]')).toHaveText('Pause');
    await page.locator('.intro-quote-window').click();
    await expect(page.locator('[data-intro-pause]')).toHaveText('Pause');
    await page.locator('[data-intro-pause]').click();
    await expect(page.locator('[data-intro-pause]')).toHaveText('Play');
    await page.locator('[data-intro-quote-button="3"]').click();
    await expect(page.locator('.intro-quote[data-current] figcaption strong')).toHaveText('Rob Smorenburg');
    await page.locator('[data-intro-pause]').click();
    await expect(page.locator('[data-intro-pause]')).toHaveText('Pause');
    await page.locator('[data-intro-chapter="3"]').click();
    await expect(page.locator('.stack-composition')).toBeVisible();
    await page.locator('[data-intro-close]').click();
    await expect(dialog).not.toBeVisible();
    await page.reload({ waitUntil: 'commit' });
    await expectPortfolioReady(page);
    await expect(dialog).not.toBeVisible();
    await page.locator('[data-intro-replay]').click();
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
});

test('experience timeline supports keyboard scrolling', async ({ page }, testInfo) => {
    await openPortfolio(page, testInfo, { animated: true, seen: false });
    await page.locator('[data-intro-chapter="1"]').click();
    await page.locator('[data-intro-pause]').click();
    const timeline = page.locator('.experience-window');
    await timeline.focus();
    await page.keyboard.press('End');
    await expect.poll(() => timeline.evaluate(element => element.scrollTop)).toBeGreaterThan(0);
    await page.keyboard.press('Home');
    await expect.poll(() => timeline.evaluate(element => element.scrollTop)).toBe(0);
    await expectAccessible(page, '.architecture-intro');
});

test('intro contact link reaches the contact form', async ({ page }, testInfo) => {
    await openPortfolio(page, testInfo);
    await page.locator('[data-intro-replay]').click();
    await page.locator('[data-intro-destination="contact"]').click();
    await expect(page.locator('.architecture-intro')).not.toBeVisible();
    await expect(page).toHaveURL(/#contact$/);
    await expect(page.locator('#contact-heading')).toBeInViewport();
    await expect(page.locator('#contact-name')).toBeVisible();
});

test('deep links bypass autoplay and reduced motion stops playback', async ({ page }, testInfo) => {
    await openPortfolio(page, testInfo, { animated: true, seen: false, hash: '#projects' });
    const dialog = page.locator('.architecture-intro');
    await expect(dialog).not.toBeVisible();
    await page.locator('[data-intro-replay]').click();
    await expect(dialog).toBeVisible();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(dialog).not.toBeVisible();
});
