import { test, expect } from '@playwright/test';
import { openPortfolio, expectAccessible } from './helpers.js';

test('photos autoplay only while visible and support hover, focus, and playback controls', async ({ page }, testInfo) => {
    await page.clock.install();
    await openPortfolio(page, testInfo, { animated: true });
    const photo = page.locator('.photo-active');
    const first = await photo.getAttribute('src');
    await page.clock.runFor(5100);
    await expect(photo).toHaveAttribute('src', first);
    await photo.scrollIntoViewIfNeeded();
    await page.mouse.move(0, 0);
    await page.clock.runFor(5100);
    await expect(photo).not.toHaveAttribute('src', first);
    const second = await photo.getAttribute('src');
    await photo.hover();
    await page.clock.runFor(5100);
    await expect(photo).toHaveAttribute('src', second);
    await page.mouse.move(0, 0);
    await page.locator('.photo-dot').first().focus();
    await page.clock.runFor(5100);
    await expect(photo).toHaveAttribute('src', second);
    const playback = page.locator('[data-photo-playback]');
    await playback.click();
    await expect(playback).toHaveText(await playback.getAttribute('data-play'));
    await page.mouse.move(0, 0);
    await page.clock.runFor(5100);
    await expect(photo).toHaveAttribute('src', second);
    await playback.click();
    await page.mouse.move(0, 0);
    await page.clock.runFor(5100);
    await expect(photo).not.toHaveAttribute('src', second);
    await expectAccessible(page, '.hobbies-layout');
});

test('reduced motion keeps photos manual', { tag: '@layout' }, async ({ page }, testInfo) => {
    await page.clock.install();
    await openPortfolio(page, testInfo);
    const photo = page.locator('.photo-active');
    await photo.scrollIntoViewIfNeeded();
    const first = await photo.getAttribute('src');
    await expect(page.locator('[data-photo-playback]')).toBeHidden();
    await page.clock.runFor(10000);
    await expect(photo).toHaveAttribute('src', first);
    await page.locator('.photo-dot').nth(1).click();
    await expect(photo).not.toHaveAttribute('src', first);
});
