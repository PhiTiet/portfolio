import { test, expect } from '@playwright/test';
import { openPortfolio, expectAccessible } from './helpers.js';

test('rapid theme switching triggers a short disco with audio, dismissal, and a cooldown', { tag: '@layout' }, async ({ page }, testInfo) => {
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
    await page.clock.runFor(1000);
    await expect(page.locator('.disco-ball')).toHaveCSS('translate', '0px');
    await expect(page.locator('.disco-ball')).toHaveCSS('rotate', 'none');
    await expect(page.locator('[data-disco-close]')).toBeFocused();
    const theme = await page.evaluate(() => localStorage.getItem('theme'));
    await expectAccessible(page);
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
    await expect(page.locator('.disco-ball')).toHaveCSS('animation-name', 'none');
    expect(await page.locator('.disco-ball').evaluate(element => getComputedStyle(element, '::after').animationName)).toBe('none');
    for (const beam of await page.locator('.disco-beam').all()) await expect(beam).toHaveCSS('animation-name', 'none');
    await page.locator('[data-disco-close]').click();
    await expect(page.locator('[data-disco]')).toBeHidden();
});

test('mirror tiles move across the ball and stay still with reduced motion', { tag: '@layout' }, async ({ page }) => {
    await page.clock.install();
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/images/disco-ball.svg');
    const mirrors = page.locator('.mirrors');
    await expect(mirrors).toHaveCSS('animation-name', 'mirror-turn');
    const initial = await mirrors.boundingBox();
    await page.clock.runFor(1000);
    await expect.poll(async () => (await mirrors.boundingBox()).x).not.toBe(initial.x);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(mirrors).toHaveCSS('animation-name', 'none');
    await expect(page.locator('.glints')).toHaveCSS('animation-name', 'none');
});
