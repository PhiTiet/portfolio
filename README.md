# Portfolio Website

![Build Status](https://img.shields.io/github/actions/workflow/status/PhiTiet/portfolio/build.yaml?branch=main)
![License](https://img.shields.io/github/license/PhiTiet/portfolio)

My personal portfolio at [phitiet.nl](https://phitiet.nl), built with Java 25,
Spring Boot 4, Thymeleaf, Tailwind CSS 4, and Alpine.js.

## Features

- English/Dutch career content from YAML, with calculated age and experience.
- Experience, projects, skills, certificates, recommendations, hobbies, and a Discord-backed contact form.
- Persistent light/dark themes, responsive layouts, keyboard navigation, and reduced-motion support.
- A six-chapter opening, from recommendations and experience to architecture, stack, AI workflow, and hiring: 41 seconds on desktop, 33 seconds on phones, and a static reduced-motion alternative. All five recommendations retain fuller, verbatim excerpts in a fourteen-second sequence of full-stage cards, with directional wipes, large typography, author attribution, and direct quote selection. Touching or focusing a card pauses playback for reading. A shared visual thread connects the last card's edge to current senior experience, then architecture. Staggered builds, light sweeps, and flowing events keep the technical chapters alive. The AI workflow culminates in human review, then gathers into a line that unfolds into the portrait frame. Includes skip, pause, seeking, replay, and an explicit portfolio entrance with a luminous curtain reveal. Autoplay is limited to the first normal visit per tab and does not wait for external icons.
- An SVG Smith-Morra chess animation with stepping, seeking, pause, and replay. Playback pauses offscreen and in background tabs.

## Run locally

Use Java 25 and Maven:

```bash
mvn package
java -jar target/portfolio.jar --server.port=8080
```

Visit `http://localhost:8080`. Set `DISCORD_WEBHOOK_URL` to enable contact delivery;
without it, submissions are accepted but no message is sent.

Career content lives in `src/main/resources/config/career-en.yml` and
`career-nl.yml`; recommendations live in `recommendations.yml`. Translations are
in `src/main/resources/messages*.properties`, and page fragments are under
`src/main/resources/templates/`.

## Frontend

Use Node.js 22 or newer:

```bash
npm ci
npm run test:scene
npm run build
```

Edit CSS and animation sources in `src/main/frontend/`, not the generated
`static/site.css`, `static/hero-scene.js`, or `static/architecture-opening.js`.
The `hero-scene.js` bundle contains the current 2D chess scene. Other scripts in
`src/main/resources/static/` are maintained directly.

Generated assets are committed, so Maven and Docker builds do not require Node.js.
Rebuild them after changing templates, frontend sources, or static scripts.
Third-party library notices are retained in `hero-scene.js.LEGAL.txt`.

## Verify

```bash
mvn clean verify
npm run test:scene
npx playwright install chromium
npm run test:browser
```

Playwright starts the packaged application on port 8080 with webhook delivery
disabled, or reuses a local server. Set `PORTFOLIO_URL` to use another running server.
Shared interactions run once; layout-sensitive scenarios also cover Dutch/light
mode and phone widths of 390px and 320px. Tests include automated axe checks,
keyboard navigation, motion preferences, and mocked contact submission.
Screenshots and traces are saved under `target/playwright/` on failure. Manual
assistive-technology checks are still needed for a full accessibility audit.

## Deployment

```bash
docker build -t phitiet/portfolio .
docker run -p 80:80 phitiet/portfolio
```

GitHub Actions verifies Java, frontend assets, and browser behavior on pull
requests and pushes to `main`. Pushes to `main` and manual workflow runs publish
the verified JAR as a Docker image to `ghcr.io/phitiet/portfolio:latest`.

## License

[MIT](LICENSE).
