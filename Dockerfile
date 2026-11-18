FROM eclipse-temurin:27-jre-alpine@sha256:a0f3b523fd89e242ce302715ce367f68e9073c59274e65746d0791c750f38de3
RUN apk add --no-cache 'ca-certificates>=20261020-r0' \
    && trust extract --overwrite --format=java-cacerts --filter=ca-anchors --purpose=server-auth "$JAVA_HOME/lib/security/cacerts" \
    && addgroup -S portfolio && adduser -S -G portfolio portfolio
LABEL maintainer="Phi"
EXPOSE 8080
COPY target/portfolio.jar /app.jar
USER portfolio
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1:8080/actuator/health || exit 1
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "/app.jar"]
