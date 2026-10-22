import { test, expect } from '@playwright/test';
import { openPortfolio, expectAccessible } from './helpers.js';

test.beforeEach(async ({ page }, testInfo) => {
    await openPortfolio(page, testInfo);
    await expect(page.locator('[data-scene-playback]')).toBeVisible();
    await expect(page.locator('#contact-name')).toBeAttached();
});

test('portfolio reflows and passes automated accessibility checks', { tag: '@layout' }, async ({ page }, testInfo) => {
    for (const id of ['recommendations', 'experience', 'skills', 'projects', 'certificates', 'hobbies', 'contact']) {
        await expect(page.locator(`#${id}`)).toBeVisible();
        await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    }
    await expect.poll(() => page.locator('.photo-active').evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
    await expectAccessible(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(page.locator('.scroll-to-top')).not.toBeVisible();
    expect(await page.pageErrors()).toEqual([]);
    await expect(page.locator('.hero > .container .portrait img')).toBeVisible();
    await expect(page.locator('#hobbies .chess-scene')).toBeVisible();
    await expect(page.locator('#hobbies').getByText(testInfo.project.metadata.language === 'nl' ? 'Tatoeages' : 'Tattoos', { exact: true })).toBeVisible();
});

test('chess controls support stepping, seeking, castling, and replay', async ({ page }) => {
    await expect(page.locator('.chess-piece')).toHaveCount(32);
    await page.locator('[data-scene-next]').click();
    await expect(page.locator('[data-scene-notation]')).toHaveText('1. e4');
    await page.locator('.chess-details summary').click();
    await page.locator('.chess-moves button').nth(12).click();
    expect(await page.locator('[data-piece="wke1"]').evaluate(piece => piece.style.transform)).toBe('translate(600%, 700%)');
    expect(await page.locator('[data-piece="wrh1"]').evaluate(piece => piece.style.transform)).toBe('translate(500%, 700%)');
    await page.locator('.chess-moves button').last().click();
    await expect(page.locator('[data-scene-next]')).toBeDisabled();
    await expect(page.locator('[data-scene-play]')).toHaveText('Replay');
    await page.locator('[data-scene-play]').click();
    await expect(page.locator('[data-scene-notation]')).toHaveText('Starting position');
    await page.locator('[data-scene-reset]').click();
    await expect(page.locator('[data-scene-next]')).toBeEnabled();
    expect(await page.locator('.chess-board').evaluate(board => board.getAnimations({ subtree: true }).length)).toBe(0);
});

test('career details, carousels, and about dialog support keyboard interaction', async ({ page }) => {
    const career = page.locator('.career-entry').nth(1);
    await career.locator('summary').focus();
    await page.keyboard.press('Enter');
    await expect(career.locator('.career-description')).toBeVisible();
    const quote = await page.locator('.recommendation-active .author-name').textContent();
    await page.locator('.carousel-nav-btn').last().click();
    await expect(page.locator('.recommendation-active .author-name')).not.toHaveText(quote);
    const photo = await page.locator('.photo-active').getAttribute('src');
    await page.locator('.photo-dot').nth(1).click();
    await expect(page.locator('.photo-active')).not.toHaveAttribute('src', photo);
    const opener = page.locator('.hero-links button');
    await opener.click();
    await expect(page.locator('.about-panel')).toBeVisible();
    await expect(page.locator('.about-panel button').first()).toBeFocused();
    await expectAccessible(page);
    await page.keyboard.press('Escape');
    await expect(page.locator('.about-panel')).not.toBeVisible();
    await expect(opener).toBeFocused();
});

test('theme and language switching preserve navigation', { tag: '@layout' }, async ({ page }, testInfo) => {
    const nextTheme = testInfo.project.metadata.theme === 'dark' ? 'light' : 'dark';
    await page.locator('.theme-toggle').click();
    await page.reload();
    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe(nextTheme);
    await expect(page.locator('html')).toHaveClass(nextTheme === 'light' ? /light/ : /^$/);
    const menu = page.locator('[aria-controls="mobile-menu"]');
    if (await menu.isVisible()) {
        await menu.click();
        await expect(page.locator('#mobile-menu')).toBeVisible();
        await page.locator('#mobile-menu a[href="#projects"]').click();
        await expect(page.locator('#mobile-menu')).not.toBeVisible();
    } else {
        await page.locator('.nav-link[href="#projects"]').click();
    }
    await expect(page).toHaveURL(/#projects$/);
    const nextLanguage = testInfo.project.metadata.language === 'en' ? 'nl' : 'en';
    await page.locator('[data-lang-switch]').filter({ hasText: nextLanguage.toUpperCase() }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', nextLanguage);
    await expect(page).toHaveURL(/#projects$/);
});

test('contact form recovers from validation and network errors before submitting', async ({ page }) => {
    let payload;
    let attempts = 0;
    await page.route('**/api/contact', async route => {
        payload = route.request().postDataJSON();
        attempts++;
        if (attempts === 1) await route.fulfill({ status: 400, contentType: 'application/json', body: '{"errors":{"email":"Check your email"}}' });
        else if (attempts === 2) await route.abort();
        else await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });
    const submit = page.locator('button[type="submit"]');
    await expect(submit).toBeDisabled();
    await page.locator('#contact-name').fill('Portfolio preview');
    await page.locator('#contact-email').fill('preview@example.com');
    await page.locator('#contact-message').fill('A local browser test, never sent to the server.');
    await submit.click();
    await expect(page.locator('#contact-email-error')).toHaveText('Check your email');
    await expect(page.locator('#contact-email')).toHaveAttribute('aria-invalid', 'true');
    await submit.click();
    await expect(page.getByText('Network error. Please try again.', { exact: true })).toBeVisible();
    await expect(submit).toBeEnabled();
    await submit.click();
    await expect(page.locator('#contact-name')).not.toBeAttached();
    expect(payload).toEqual({ name: 'Portfolio preview', email: 'preview@example.com', message: 'A local browser test, never sent to the server.' });
});

test('chess pauses for reduced motion and when offscreen', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.reload();
    await expect(page.locator('[data-scene-play]')).toHaveText('Pause');
    await page.locator('.chess-scene').scrollIntoViewIfNeeded();
    await expect(page.locator('[data-scene-notation]')).toHaveText('1. e4', { timeout: 4000 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('[data-scene-play]')).toHaveText('Play');
    await page.clock.install();
    await page.locator('[data-scene-play]').click();
    await page.locator('.hero').scrollIntoViewIfNeeded();
    await expect(page.locator('.chess-scene')).not.toBeInViewport();
    const notation = await page.locator('[data-scene-notation]').textContent();
    await page.clock.runFor(5000);
    await expect(page.locator('[data-scene-notation]')).toHaveText(notation);
});

test('content tolerates doubled text and generous spacing', async ({ page }) => {
    await page.addStyleTag({ content: 'html { font-size: 200%; } * { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
});

test('career highlights retain full details and safe contextual links', async ({ page }) => {
    const highlight = page.locator('#timeline-ahold .career-highlight');
    await expect(highlight).toBeVisible();
    await expect(highlight.locator('.career-highlight-summary')).not.toBeEmpty();
    await expect(highlight.locator('.career-highlight-responsibilities li')).toHaveCount(5);
    const links = await highlight.locator('.coverage-links a').evaluateAll(elements => elements.map(element => ({ href: element.href, target: element.target, rel: element.rel })));
    expect(links).toHaveLength(3);
    for (const link of links) {
        expect(link.href).toMatch(/^https:\/\//);
        expect(link.target).toBe('_blank');
        expect(link.rel).toContain('noopener');
    }
    await expect(page.locator('#project-ahold .career-highlight-summary')).toHaveText(await highlight.locator('.career-highlight-summary').textContent());
    await expect(page.locator('#project-ahold .career-highlight-responsibilities')).toHaveCount(0);
});
