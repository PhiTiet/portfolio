import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './src/test/browser',
    outputDir: './target/playwright',
    fullyParallel: true,
    workers: 2,
    reporter: 'list',
    webServer: process.env.PORTFOLIO_URL ? undefined : {
        command: 'java -jar target/portfolio.jar --server.address=127.0.0.1 --server.port=8080 --portfolio.discord.webhook-url=',
        url: 'http://127.0.0.1:8080',
        reuseExistingServer: !process.env.CI
    },
    use: {
        baseURL: process.env.PORTFOLIO_URL || 'http://127.0.0.1:8080',
        reducedMotion: 'reduce',
        screenshot: 'only-on-failure',
        trace: 'retain-on-failure'
    },
    projects: [
        { name: 'desktop-dark', use: { viewport: { width: 1440, height: 1000 } }, metadata: { theme: 'dark', language: 'en' } },
        { name: 'narrow-light-nl', grep: /@layout/, use: { viewport: { width: 320, height: 740 }, isMobile: true, hasTouch: true }, metadata: { theme: 'light', language: 'nl' } }
    ]
});
