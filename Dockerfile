FROM eclipse-temurin:25-jre-alpine
LABEL maintainer="Phi"
EXPOSE 80
COPY target/portfolio.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
