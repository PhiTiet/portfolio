import { test, expect } from '@playwright/test';
import { openPortfolio, expectAccessible } from './helpers.js';

test('rapid theme switching triggers a short disco with audio, dismissal, and a cooldown', async ({ page }, testInfo) => {
    await page.clock.install();
    await openPortfolio(page, testInfo, { animated: true });
    const toggle = page.locator('.theme-toggle');
    const disco = page.locator('[data-disco]');
    const audio = disco.locator('audio');
    for (let i = 0; i < 4; i++) await toggle.click();
    await expect(disco).toBeHidden();
    await page.clock.runFor(3100);
    await toggle.click();
    await expect(disco).toBeHidden();
    for (let i = 0; i < 4; i++) await toggle.click();
    await expect(disco).toBeVisible();
    await expect(audio).toHaveJSProperty('paused', false);
    await expect.poll(() => audio.evaluate(element => element.readyState)).toBeGreaterThanOrEqual(2);
    await expect(page.locator('[data-disco-close]')).toBeFocused();
    const theme = await page.evaluate(() => localStorage.getItem('theme'));
    await expectAccessible(page, '[data-disco]');
    await page.keyboard.press('Escape');
    await expect(disco).toBeHidden();
    await expect(toggle).toBeFocused();
    await expect(audio).toHaveJSProperty('paused', true);
    await expect(audio).toHaveJSProperty('currentTime', 0);
    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe(theme);
    for (let i = 0; i < 5; i++) await toggle.click();
    await expect(disco).toBeHidden();
    await page.clock.runFor(30000);
    for (let i = 0; i < 5; i++) await toggle.click();
    await expect(disco).toBeVisible();
    await page.clock.runFor(8100);
    await expect(disco).toBeHidden();
    await expect(audio).toHaveJSProperty('paused', true);
});

test('reduced motion uses static disco lights and the close button dismisses them', { tag: '@layout' }, async ({ page }, testInfo) => {
    await openPortfolio(page, testInfo);
    for (let i = 0; i < 5; i++) await page.locator('.theme-toggle').click();
    await expect(page.locator('[data-disco]')).toBeVisible();
    expect(await page.locator('[data-disco]').evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0);
    await page.locator('[data-disco-close]').click();
    await expect(page.locator('[data-disco]')).toBeHidden();
});
