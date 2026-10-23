import { test, expect } from '@playwright/test';
import { expectPortfolioReady } from './helpers.js';
import { STORAGE_KEY } from '../../main/frontend/architecture-opening.js';

test('system preference is used until the visitor saves a theme', async ({ page }) => {
    await page.addInitScript(key => sessionStorage.setItem(key, 'true'), STORAGE_KEY);
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
    await page.goto('/');
    await expectPortfolioReady(page);
    await expect(page.locator('html')).toHaveClass(/light/);
    await page.locator('.theme-toggle').click();
    await page.reload();
    await expectPortfolioReady(page);
    await expect(page.locator('html')).not.toHaveClass(/light/);
});
