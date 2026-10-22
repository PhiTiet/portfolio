import { expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { STORAGE_KEY } from '../../main/frontend/architecture-opening.js';

export async function openPortfolio(page, testInfo, { animated = false, seen = true, hash = '' } = {}) {
    await page.addInitScript(({ theme, seen, key }) => {
        if (!localStorage.getItem('theme')) localStorage.setItem('theme', theme);
        if (seen) sessionStorage.setItem(key, 'true');
    }, { theme: testInfo.project.metadata.theme, seen, key: STORAGE_KEY });
    await page.emulateMedia({ reducedMotion: animated ? 'no-preference' : 'reduce' });
    await page.goto(`/?lang=${testInfo.project.metadata.language}${hash}`);
    await expect(page.locator('[data-intro-replay]')).toBeVisible();
}

export async function expectAccessible(page) {
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(results.violations).toEqual([]);
}
