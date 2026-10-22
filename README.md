# Portfolio Website

![Build Status](https://img.shields.io/github/actions/workflow/status/PhiTiet/portfolio/build_and_publish.yaml?branch=main)
![Last Commit](https://img.shields.io/github/last-commit/PhiTiet/portfolio)
![Website Status](https://img.shields.io/website?url=https%3A%2F%2Fphitiet.nl)
![License](https://img.shields.io/github/license/PhiTiet/portfolio)

My personal portfolio website. Built to showcase my experience, skills, and work as a software engineer while reflecting how I approach software development in practice.

## Live Website

[phitiet.nl](https://phitiet.nl)

## Tech Stack

- **Java 25** with **Spring Boot 4**
- **Thymeleaf** with Layout Dialect for server-side rendering
- **Tailwind CSS 4** and **Alpine.js** for the frontend
- **Spring Security** for access control
- **Docker** for containerized deployment
- **GitHub Actions** for CI/CD, pushing images to GHCR
- **Dependabot** and **CodeQL** for dependency updates and code quality

## Features

- Single-page design with anchor-linked sections: experience timeline, skills, projects, certificates, recommendations, hobbies, and contact
- All career content is driven by YAML configuration -- adding a job, skill, or certificate requires no code changes
- Dynamic values like age, years of experience, and runtime versions are computed at request time
- Light/dark theme toggle with system preference detection and localStorage persistence
- Custom error pages (404, 500) with consistent layout
- Full i18n support (English and Dutch)
- Contact form (frontend-ready, backend wiring pending)
- Accessibility-first: semantic HTML, ARIA labels, keyboard navigation, skip links, reduced-motion support
- Scroll-reveal animations and interactive components (carousel with keyboard nav, expandable text, photo slideshow)
- Layered architecture with clear separation between API, core, and domain layers
- Test coverage using JUnit 5, Mockito, AssertJ, and EqualsVerifier with dedicated test factories

## Project Structure

```
src/main/java/nl/personal/portfolio/
  api/          controllers, security config, exception handling
  core/         services and mappers
  domain/       records, interfaces, configuration binding

src/main/resources/
  config/       career.yml (all portfolio content)
  templates/    Thymeleaf layout and fragment files
  static/       CSS, JS, images, PDFs

src/test/       mirrors main structure, includes test factories
```

## Getting Started

```bash
git clone https://github.com/PhiTiet/portfolio.git
cd portfolio
mvn clean install
mvn spring-boot:run
```

Then visit `http://localhost` in your browser.

### Frontend build

The hero features a permanent portrait. The hobbies section includes an original, flat SVG chess set.
chess.js validates the Smith-Morra opening; the native Web Animations API animates
the pieces. Playback supports pause, restart, stepping, and seeking, respects
reduced motion, and stops advancing when offscreen or in a background tab.

Tailwind CSS is compiled locally rather than in the browser. Generated CSS and
JavaScript are checked in, so Maven and Docker builds do not need Node.js.
After changing templates or frontend sources, use Node.js 22 or newer:

```bash
npm ci
npm run test:scene
npm run build
```

Edit `src/main/frontend/site.css`, `chess-scene.js`, and `opening.js`, not the
generated `src/main/resources/static/site.css` or `hero-scene.js` files.
CSS source detection includes all Thymeleaf templates and static JavaScript.

### Architecture opening

The desktop opening lasts 34 seconds and uses native Web Animations and original HTML/CSS artwork,
with no extra runtime libraries. Five chapters cover architecture, the Java/Kotlin
stack, an OpenCode agentic workflow, career history and target roles, and a hiring
invitation. The first chapter travels vertically through C4 context, container,
component, and code levels; Kubernetes is explicitly a separate deployment context.
Four generically named services exchange events through Kafka topics. The camera
then follows Service A into nested adapter, application/port, and domain layers,
with inward source dependencies. The example is not a diagram of a client system.
The C4 zoom levels follow [c4model.com](https://c4model.com/diagrams).

It plays once per tab session on a normal first visit, never on deep links,
reloads, or with reduced motion. Skip, pause, chapter selection, Escape, and
replay remain available. Reduced-motion replay opens a static, navigable version.
Background tabs pause playback. Overlapping transitions carry shared elements
between chapters instead of fading to an empty screen. The AI-to-experience handoff
crossfades at natural text size rather than squeezing a label into a numeric badge.
The animation background is flat, without ambient gradients. Career entries and years
of experience come from the existing career data. The hiring chapter links to the
real contact and project sections. Reduced motion shows a static architecture
overview and the complete career list.

The original portrait-left, large “Hire me” composition is used for both the
hiring frame and the page hero through the same `hero-content.html` fragment.
The opening measures the live hero to match its layout, portrait crop, typography,
buttons, responsive breakpoints, and theme. The final reveal crossfades the frame
without moving the underlying hero; browser tests check element bounds before
and after the handoff. A 0.5-second entrance is followed by a 1.5-second hold,
then the final frame crossfades into the page.

Phones use a 20-second version with the same five chapters, a compact architecture
overview, short opacity-only transitions, and a complete career list without automatic scrolling.
It avoids camera pans, flying tiles, and staggered agent animations. The profile is
selected when playback starts, using viewport width and coarse-pointer capabilities;
it also covers phone landscape layouts. Reduced motion remains a separate static
alternative, and both profiles preserve the final hero alignment and hiring links.

The site uses an orange-led palette: warm off-white type on charcoal/ink surfaces,
with teal supporting technical content and violet distinguishing credentials.
Light mode uses warm porcelain and burnt orange. Shared CSS tokens keep the
opening's final frame and the real hero in the same theme.

Edit `architecture-opening.js`, `architecture-opening.css`, and the
`architecture-opening.html` fragment, then run `npm run build`. The generated
`static/architecture-opening.js` is checked in alongside the other browser assets.

## Docker

```bash
docker build -t phitiet/portfolio .
docker run -p 80:80 phitiet/portfolio
```

## Testing

```bash
mvn test
```

Uses JUnit 5, Mockito, AssertJ, and EqualsVerifier. Test data is created through dedicated factory classes.

With the application running at `http://127.0.0.1:8080` and Chrome installed:

```bash
npm run test:scene
npm run test:browser
```

Set `PORTFOLIO_URL` to test another local port. Playwright covers English/Dutch,
light/dark themes, desktop/mobile layouts down to 320px, keyboard interactions,
chess playback, reduced motion, doubled text, and mocked contact submission.
axe-core checks the page and dialog; manual assistive-technology verification
is still needed for a full accessibility audit. Screenshots are written to
`target/playwright/`.

## CI/CD

GitHub Actions handles the pipeline:
- **Pull requests** -- build and verify
- **Push to main** -- build, package, and push a Docker image to GHCR

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

Third-party library notices are included in `hero-scene.js.LEGAL.txt`.
Retained assets from the earlier 3D prototype keep their original attribution
in `src/main/resources/static/images/chess-scene/v1/CREDITS.txt`; the current
page does not load them.
