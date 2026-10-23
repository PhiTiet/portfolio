# Portfolio

My personal website at [phitiet.nl](https://phitiet.nl), built with Java, Spring Boot,
Thymeleaf, Tailwind CSS, and Alpine.js.

## Run locally

Requires Java 25 and Maven.

```bash
mvn package
java -jar target/portfolio.jar --server.port=8080
```

Open [localhost:8080](http://localhost:8080). Set `DISCORD_WEBHOOK_URL` to enable the contact form's message delivery.

## Frontend and tests

Requires Node.js 22 or newer. Edit frontend sources in `src/main/frontend/` and
commit the rebuilt assets from `npm run build`.

```bash
npm ci
npm run build
mvn clean verify
npm run test:scene
npx playwright install chromium
npm run test:browser
```

Successful builds on `main` publish `ghcr.io/phitiet/portfolio:latest`.

[MIT license](LICENSE).
