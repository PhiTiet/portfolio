import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function firstVisit(page, language, animated = false) {
    await page.emulateMedia({ reducedMotion: animated ? 'no-preference' : 'reduce' });
    await page.goto(`/?lang=${language}`);
    await expect(page.locator('[data-intro-replay]')).toBeVisible();
}

test('reduced motion gets an accessible static story with every chapter available', async ({ page }, testInfo) => {
    await firstVisit(page, testInfo.project.metadata.language);
    const dialog = page.locator('.architecture-intro');
    await expect(dialog).not.toBeVisible();
    const replay = page.locator('[data-intro-replay]');
    await replay.click();
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('data-chapter', 'hire');
    await expect(page.locator('[data-intro-pause]')).not.toBeVisible();
    for (const [index, chapter] of ['architecture', 'stack', 'ai', 'experience', 'hire'].entries()) {
        await page.locator(`[data-intro-chapter="${index}"]`).click();
        await expect(dialog).toHaveAttribute('data-chapter', chapter);
        await expect(page.locator(`[data-intro-act="${chapter}"]`)).toBeVisible();
        expect(await dialog.evaluate(element => element.scrollWidth - element.clientWidth)).toBe(0);
        expect(await dialog.evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0);
        const chapterResults = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
        expect(chapterResults.violations).toEqual([]);
        await page.screenshot({ path: testInfo.outputPath(`opening-${chapter}.png`) });
    }
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(results.violations).toEqual([]);
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(replay).toBeFocused();
});

test('first visit plays once, can pause and seek, then skips without trapping focus', async ({ page }, testInfo) => {
    await firstVisit(page, testInfo.project.metadata.language, true);
    const dialog = page.locator('.architecture-intro');
    await expect(dialog).toBeVisible();
    await expect(page.locator('[data-intro-close]')).toBeFocused();
    await page.locator('[data-intro-pause]').click();
    await expect.poll(() => page.locator('.intro-progress > span').evaluate(element => element.getAnimations()[0].playState)).toBe('paused');
    await page.locator('[data-intro-chapter="1"]').click();
    await expect(dialog).toHaveAttribute('data-chapter', 'stack');
    await expect(page.locator('.stack-composition')).toBeVisible();
    await page.locator('[data-intro-pause]').click();
    await expect.poll(() => page.locator('.intro-progress > span').evaluate(element => element.getAnimations()[0].playState)).toBe('running');
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

test('the sequence completes into the hero and releases all opening animations', async ({ page }, testInfo) => {
    await firstVisit(page, testInfo.project.metadata.language, true);
    const dialog = page.locator('.architecture-intro');
    await expect(dialog).toBeVisible();
    await page.locator('[data-intro-chapter="4"]').click();
    await expect(dialog).toHaveAttribute('data-chapter', 'hire');
    await expect(dialog).not.toBeVisible({ timeout: 9000 });
    expect(await dialog.evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0);
    await expect(page.locator('.hero h1')).toBeFocused();
    await expect(page.locator('.hero > .container .portrait img')).toBeVisible();
    expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe('hidden');
});

test('deep links and changed motion preferences never hold the visitor in an opening', async ({ page }, testInfo) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto(`/?lang=${testInfo.project.metadata.language}#projects`);
    await expect(page.locator('.architecture-intro')).not.toBeVisible();
    await page.locator('[data-intro-replay]').click();
    await expect(page.locator('.architecture-intro')).toBeVisible();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('.architecture-intro')).not.toBeVisible();
    await expect(page.locator('[data-intro-replay]')).toBeFocused();
});

test('background tabs pause the timeline without overriding an explicit pause', async ({ page }, testInfo) => {
    await firstVisit(page, testInfo.project.metadata.language, true);
    const state = () => page.locator('.intro-progress > span').evaluate(element => element.getAnimations()[0].playState);
    const visibility = async hidden => page.evaluate(value => {
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
    await page.keyboard.press('Escape');
    await expect(page.locator('.architecture-intro')).not.toBeVisible();
});

test('the story uses the real stack, OpenCode workflow, career history, and confirmed roles', async ({ page }, testInfo) => {
    await firstVisit(page, testInfo.project.metadata.language);
    await page.locator('[data-intro-replay]').click();
    await expect(page.locator('[data-intro-chapter]')).toHaveCount(5);
    await page.locator('[data-intro-chapter="1"]').click();
    for (const technology of ['Java', 'Kotlin', 'Spring Boot', 'Kafka', 'PostgreSQL', 'Kubernetes / AKS', 'ArgoCD', 'GitHub Actions']) {
        await expect(page.locator('.stack-composition').getByText(technology, { exact: true })).toBeVisible();
    }
    await page.locator('[data-intro-chapter="2"]').click();
    await expect(page.locator('.opencode-hub strong')).toHaveText('OpenCode');
    await expect(page.locator('.agent-branches small')).toHaveText(['explore', 'developer', 'reviewer']);
    await page.locator('[data-intro-chapter="3"]').click();
    await expect(page.locator('.experience-track h4')).toHaveText(['MedIT Solutions B.V.', 'Ordina', 'Rabobank', 'Qualogy', 'Ahold Delhaize']);
    const ahold = page.locator('.experience-track li').filter({ has: page.locator('h4', { hasText: 'Ahold Delhaize' }) });
    await expect(ahold.locator('.career-year')).toHaveText(testInfo.project.metadata.language === 'nl' ? '2024–nu' : '2024–now');
    await expect(page.locator('.target-roles li')).toHaveText(['Senior Software Engineer', 'Senior Java/Kotlin Engineer', 'Senior Backend Engineer']);
    await page.keyboard.press('Escape');
});

test('the final hiring action closes the story and reaches the actual contact section', async ({ page }, testInfo) => {
    await firstVisit(page, testInfo.project.metadata.language);
    await page.locator('[data-intro-replay]').click();
    await page.locator('[data-intro-destination="contact"]').click();
    await expect(page.locator('.architecture-intro')).not.toBeVisible();
    await expect(page).toHaveURL(/#contact$/);
    await expect(page.locator('#contact-heading')).toBeInViewport();
    await expect(page.locator('#contact-name')).toBeVisible();
});

test('Java and Kotlin travel from the architecture code into the stack composition', async ({ page }, testInfo) => {
    await firstVisit(page, testInfo.project.metadata.language, true);
    await page.evaluate(() => {
        document.querySelector('.intro-progress > span').getAnimations()[0].currentTime = 10000;
        document.querySelector('.c4-world').getAnimations()[0].finish();
    });
    await page.locator('[data-intro-chapter="1"]').click();
    await expect(page.locator('.intro-portal .intro-morph')).toHaveCount(2);
    await expect(page.locator('.language-tile').first()).toHaveCSS('opacity', '0');
    await page.screenshot({ path: testInfo.outputPath('shared-element-transition.png') });
    await expect(page.locator('.intro-portal .intro-morph')).toHaveCount(0);
    await expect(page.locator('[data-intro-act="architecture"]')).not.toBeVisible();
    await expect(page.locator('[data-intro-act="stack"]')).toBeVisible();
    await page.keyboard.press('Escape');
});

test('architecture is a generic Kafka service network with inward-facing clean layers', async ({ page }, testInfo) => {
    await firstVisit(page, testInfo.project.metadata.language);
    await page.locator('[data-intro-replay]').click();
    await page.locator('[data-intro-chapter="0"]').click();
    await expect(page.locator('.microservice-network [data-service]')).toHaveCount(4);
    await expect(page.locator('.microservice-network [data-topic]')).toHaveCount(2);
    await expect(page.locator('.microservice-network .service-selected')).toHaveCount(1);
    await expect(page.locator('.clean-service .clean-application .clean-domain')).toHaveCount(1);
    await expect(page.locator('.driving-adapters')).toContainText('Kafka consumer');
    await expect(page.locator('.driven-adapters')).toContainText('Kafka publisher');
    await expect(page.locator('.architecture-act')).not.toContainText(/campaign|billing|marketing/i);
    await expect(page.locator('.intro-editor')).toContainText('ExecuteUseCase');
    await page.keyboard.press('Escape');
});

test('the final frame matches hero geometry and reveals it without a layout jump', async ({ page }, testInfo) => {
    await page.addInitScript(theme => localStorage.setItem('theme', theme), testInfo.project.metadata.theme);
    await firstVisit(page, testInfo.project.metadata.language, true);
    await page.locator('[data-intro-chapter="4"]').click();
    const differences = () => page.evaluate(() => {
        const selectors = ['.hero-name', '.hero-role', '.portrait img', '.hero-experience', '.hero-description', '.hero-actions'];
        return selectors.flatMap(selector => {
            const actual = document.querySelector(`.hero > .container > .hero-layout ${selector}`).getBoundingClientRect();
            const final = document.querySelector(`.hero-final ${selector}`).getBoundingClientRect();
            return ['x', 'y', 'width', 'height'].map(property => Math.abs(actual[property] - final[property]));
        });
    });
    await expect.poll(async () => Math.max(...await differences())).toBeLessThan(0.5);
    await page.screenshot({ path: testInfo.outputPath('aligned-final-frame.png') });
    const before = await page.locator('.hero-final .portrait img').boundingBox();
    await page.locator('.intro-progress > span').evaluate(element => element.getAnimations()[0].finish());
    await expect(page.locator('.architecture-intro')).not.toBeVisible();
    const after = await page.locator('.hero > .container .portrait img').boundingBox();
    for (const property of ['x', 'y', 'width', 'height']) expect(Math.abs(before[property] - after[property])).toBeLessThan(0.5);
    expect(await page.locator('.hero > .container > .hero-layout').evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0);
    await page.screenshot({ path: testInfo.outputPath('revealed-hero.png') });
});
