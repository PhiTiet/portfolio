import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './src/test/browser',
    outputDir: './target/playwright',
    fullyParallel: true,
    workers: 4,
    reporter: 'list',
    use: {
        baseURL: process.env.PORTFOLIO_URL || 'http://127.0.0.1:8080',
        channel: 'chrome',
        reducedMotion: 'reduce',
        screenshot: 'only-on-failure',
        trace: 'retain-on-failure'
    },
    projects: [
        { name: 'desktop-dark', use: { viewport: { width: 1440, height: 1000 } }, metadata: { theme: 'dark', language: 'en' } },
        { name: 'desktop-light-nl', use: { viewport: { width: 1440, height: 1000 } }, metadata: { theme: 'light', language: 'nl' } },
        { name: 'mobile-dark', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }, metadata: { theme: 'dark', language: 'en' } },
        { name: 'narrow-light-nl', use: { viewport: { width: 320, height: 740 }, isMobile: true, hasTouch: true }, metadata: { theme: 'light', language: 'nl' } }
    ]
});
