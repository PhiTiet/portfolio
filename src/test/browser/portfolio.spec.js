import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }, testInfo) => {
    await page.addInitScript(theme => {
        if (!localStorage.getItem('theme')) localStorage.setItem('theme', theme);
    }, testInfo.project.metadata.theme);
    await page.goto(`/?lang=${testInfo.project.metadata.language}`);
    await expect(page.locator('[data-scene-playback]')).toBeVisible();
    await expect(page.locator('#contact-name')).toBeAttached();
});

test('all sections reflow, retain their content, and pass automated accessibility checks', async ({ page }, testInfo) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const id of ['recommendations', 'experience', 'skills', 'projects', 'certificates', 'hobbies', 'contact']) {
        await expect(page.locator(`#${id}`)).toBeVisible();
        await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    }
    await expect(page.locator('.photo-active')).toBeVisible();
    await expect.poll(() => page.locator('.photo-active').evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBe(0);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(results.violations).toEqual([]);
    expect(errors).toEqual([]);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(page.locator('.scroll-to-top')).not.toBeVisible();
    await page.screenshot({ path: testInfo.outputPath('portfolio-full.png'), fullPage: true });
    await page.screenshot({ path: testInfo.outputPath('portfolio-hero.png') });
});

test('chess controls support stepping, seeking, castling, replay, and reduced motion', async ({ page }) => {
    await expect(page.locator('[data-scene-play]')).toHaveText(/^(Play|Afspelen)$/);
    await expect(page.locator('.chess-piece')).toHaveCount(32);
    await page.locator('[data-scene-next]').click();
    await expect(page.locator('[data-scene-notation]')).toHaveText('1. e4');
    await expect(page.locator('[data-piece="wpe2"]')).toHaveCSS('transform', /matrix/);
    await page.locator('.chess-details summary').click();
    await page.locator('.chess-moves button').nth(12).click();
    expect(await page.locator('[data-piece="wke1"]').evaluate(piece => piece.style.transform)).toBe('translate(600%, 700%)');
    expect(await page.locator('[data-piece="wrh1"]').evaluate(piece => piece.style.transform)).toBe('translate(500%, 700%)');
    await page.locator('.chess-moves button').last().click();
    await expect(page.locator('[data-scene-next]')).toBeDisabled();
    await expect(page.locator('[data-scene-play]')).toHaveText(/^(Replay|Opnieuw)$/);
    await page.locator('[data-scene-play]').click();
    await expect(page.locator('[data-scene-notation]')).toHaveText(/^(Starting position|Beginstelling)$/);
    await page.locator('[data-scene-reset]').click();
    await expect(page.locator('[data-scene-next]')).toBeEnabled();
    expect(await page.locator('.chess-board').evaluate(board => board.getAnimations({ subtree: true }).length)).toBe(0);
});

test('career details, recommendations, photos, and the native dialog are keyboard accessible', async ({ page }) => {
    const career = page.locator('.career-entry').nth(1);
    await career.locator('summary').focus();
    await page.keyboard.press('Enter');
    await expect(career).toHaveAttribute('open', '');
    await expect(career.locator('.career-description')).toBeVisible();
    const quote = await page.locator('.recommendation-active .author-name').textContent();
    await page.locator('.carousel-nav-btn').last().click();
    await expect(page.locator('.recommendation-active .author-name')).not.toHaveText(quote);
    const photo = await page.locator('.photo-active').getAttribute('src');
    await page.locator('.photo-dot').nth(1).click();
    await expect(page.locator('.photo-active')).not.toHaveAttribute('src', photo);
    const opener = page.locator('.hero-links button');
    await opener.click();
    await expect(page.locator('dialog')).toBeVisible();
    await expect(page.locator('dialog button').first()).toBeFocused();
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(results.violations).toEqual([]);
    await page.keyboard.press('Escape');
    await expect(page.locator('dialog')).not.toBeVisible();
    await expect(opener).toBeFocused();
});

test('theme and language switching preserve usable navigation', async ({ page }, testInfo) => {
    await page.locator('.theme-toggle').click();
    expect(await page.evaluate(() => localStorage.getItem('theme'))).not.toBe(testInfo.project.metadata.theme);
    await page.reload();
    expect(await page.evaluate(() => localStorage.getItem('theme'))).not.toBe(testInfo.project.metadata.theme);
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
    await page.locator('[data-lang-switch]').filter({ hasText: testInfo.project.metadata.language === 'en' ? 'NL' : 'EN' }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', testInfo.project.metadata.language === 'en' ? 'nl' : 'en');
    await expect(page).toHaveURL(/#projects$/);
});

test('contact form preserves validation and submission without sending a real message', async ({ page }) => {
    let payload;
    await page.route('**/api/contact', async route => {
        payload = route.request().postDataJSON();
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });
    const submit = page.locator('button[type="submit"]');
    await expect(submit).toBeDisabled();
    await page.locator('#contact-name').fill('Portfolio preview');
    await page.locator('#contact-email').fill('preview@example.com');
    await page.locator('#contact-message').fill('A local browser test, never sent to the server.');
    await submit.click();
    await expect(page.locator('#contact-name')).not.toBeAttached();
    expect(payload.name).toBe('Portfolio preview');
});

test('animation plays smoothly, stops offscreen, and responds to reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.reload();
    await expect(page.locator('[data-scene-play]')).toHaveText(/^(Pause|Pauzeren)$/);
    await page.locator('.chess-scene').scrollIntoViewIfNeeded();
    await expect(page.locator('[data-scene-notation]')).toHaveText('1. e4', { timeout: 4000 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('[data-scene-play]')).toHaveText(/^(Play|Afspelen)$/);
    await page.clock.install();
    await page.locator('[data-scene-play]').click();
    await page.locator('.hero').scrollIntoViewIfNeeded();
    await expect(page.locator('.chess-scene')).not.toBeInViewport();
    const notation = await page.locator('[data-scene-notation]').textContent();
    await page.clock.runFor(5000);
    await expect(page.locator('[data-scene-notation]')).toHaveText(notation);
});

test('desktop content tolerates doubled text and generous text spacing', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.addStyleTag({ content: 'html { font-size: 200%; } * { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBe(0);
});

test('hero keeps the portrait while chess belongs to the hobbies section', async ({ page }) => {
    await expect(page.locator('.hero .chess-scene')).toHaveCount(0);
    await expect(page.locator('#hobbies .chess-scene')).toHaveCount(1);
    const portrait = await page.locator('.portrait img').boundingBox();
    const name = await page.locator('.hero h1').boundingBox();
    expect(portrait.x).toBeGreaterThanOrEqual(name.x + name.width);
    if (page.viewportSize().width <= 880) {
        expect(portrait.y).toBeLessThan(name.y + name.height);
    }
});
