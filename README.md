# Portfolio Website

![Build Status](https://img.shields.io/github/actions/workflow/status/PhiTiet/portfolio/build_and_publish.yml?branch=main)
![Last Commit](https://img.shields.io/github/last-commit/PhiTiet/portfolio)
![Docker Image](https://img.shields.io/docker/image-size/phitiet/portfolio/latest)
![Website Status](https://img.shields.io/website?url=https%3A%2F%2Fphitiet.nl)

Welcome to my personal portfolio website repository! This project showcases my skills, experience, and work as a software engineer. It's designed to demonstrate modern software development practices and includes tools and technologies that I actively use.

## Features

- **Responsive Design**: Built with Bootstrap 5 for responsive usability across devices.
- **Dynamic Content**: Utilizes Thymeleaf for server-side rendering of pages.
- **Backend Framework**: Powered by Spring Boot, ensuring scalability and maintainability.
- **Containerized Deployment**: Dockerized for ease of deployment.
- **CI/CD**: Automated build and deployment with GitHub Actions.
- **Dependabot/CodeQL** for repeating updates/quality control.
- **Clean Code & Architecture** Shows my understanding of code and architecture

## Live Website

You can view the live website here: [phitiet.nl](https://phitiet.nl)

## Project Structure

```
├── .github/             # github
├── src/                 # source code
├── Dockerfile           # docker 
├── pom.xml              # maven
└── README.md            
```

## Getting Started

Follow these steps to run the project locally:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/PhiTiet/portfolio.git
   cd portfolio
   ```

2. **Build the project**:
   ```bash
   mvn clean install
   ```

3. **Run the application**:
   ```bash
   mvn spring-boot:run
   ```

4. **Access the application**:
   Visit `http://localhost` in your browser.

## 🐳 Docker

To build and run the Docker container:

```bash
docker build -t phitiet/portfolio .
docker run -p 80:80 phitiet/portfolio
```

## Testing

Testing is handled using JUnit 5 and AssertJ.

Run tests with:
```bash
mvn test
```

## CI/CD Workflow

This project uses GitHub Actions for CI/CD. The workflow includes:
- Building the application.
- Running tests.
- Pushing Docker images to Docker Hub.
- Deploying to AKS.

