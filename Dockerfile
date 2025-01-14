FROM alpine/java:21-jdk
MAINTAINER Phi
EXPOSE 80
COPY target/portfolio.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]