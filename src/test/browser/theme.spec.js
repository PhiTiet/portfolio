import { test, expect } from '@playwright/test';
import { expectAccessible, expectPortfolioReady } from './helpers.js';
import { STORAGE_KEY } from '../../main/frontend/architecture-opening.js';

test('system preference is used until the visitor saves a theme', { tag: '@layout' }, async ({ page }) => {
    await page.addInitScript(key => sessionStorage.setItem(key, 'true'), STORAGE_KEY);
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
    await page.goto('/');
    await expectPortfolioReady(page);
    await expect(page.locator('html')).toHaveClass(/light/);
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expectAccessible(page);
    await page.locator('.theme-toggle').click();
    await page.reload();
    await expectPortfolioReady(page);
    await expect(page.locator('html')).not.toHaveClass(/light/);
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(25, 26, 32)');
});
