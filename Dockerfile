FROM eclipse-temurin:21
MAINTAINER Phi
EXPOSE 8080
COPY target/portfolio.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]

# docker build -t phitiet/portfolio .