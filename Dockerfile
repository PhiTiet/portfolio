FROM eclipse-temurin:27-jre-alpine@sha256:0faf24c1d1e778bbc0700fc71c53b081c9432f1e51e6e41c86c63840e8b89ac1
RUN apk add --no-cache 'ca-certificates>=20261020-r0' \
    && trust extract --overwrite --format=java-cacerts --filter=ca-anchors --purpose=server-auth "$JAVA_HOME/lib/security/cacerts"
LABEL maintainer="Phi"
EXPOSE 80
COPY target/portfolio.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
