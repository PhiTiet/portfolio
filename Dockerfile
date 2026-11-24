FROM eclipse-temurin:27-jre-alpine@sha256:51f686a5322c0b762dff27e8e94b4b6582d7e71321d3a23b1f3c53b4078aabc5
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
