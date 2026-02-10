# Portfolio Website

![Build Status](https://img.shields.io/github/actions/workflow/status/PhiTiet/portfolio/build_and_publish.yaml?branch=main)
![Last Commit](https://img.shields.io/github/last-commit/PhiTiet/portfolio)
![Website Status](https://img.shields.io/website?url=https%3A%2F%2Fphitiet.nl)

My personal portfolio website. Built to showcase my experience, skills, and work as a software engineer while reflecting how I approach software development in practice.

## Live Website

[phitiet.nl](https://phitiet.nl)

## Tech Stack

- **Java 25** with **Spring Boot 4**
- **Thymeleaf** with Layout Dialect for server-side rendering
- **Tailwind CSS 4** and **Alpine.js** for the frontend
- **HTMX** for progressive enhancement
- **Spring Security** for access control
- **Docker** for containerized deployment
- **GitHub Actions** for CI/CD, pushing images to GHCR
- **Dependabot** and **CodeQL** for dependency updates and code quality

## Features

- Single-page design with anchor-linked sections: experience timeline, skills, certificates, recommendations, and hobbies
- All career content is driven by YAML configuration -- adding a job, skill, or certificate requires no code changes
- Dynamic values like age, years of experience, and runtime versions are computed at request time
- Responsive dark theme built with CSS custom properties
- Accessibility-first: semantic HTML, ARIA labels, keyboard navigation, reduced-motion support
- Scroll-reveal animations and interactive components (carousel, expandable text, photo slideshow)
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

## CI/CD

GitHub Actions handles the pipeline:
- **Pull requests** -- build and verify
- **Push to main** -- build, package, and push a Docker image to GHCR
