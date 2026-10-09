# syntax=docker/dockerfile:1
FROM eclipse-temurin:21-jre-jammy
COPY --from=docker:27-cli /usr/local/bin/docker /usr/local/bin/docker
COPY --from=docker:27-cli /usr/local/libexec/docker/cli-plugins /usr/local/libexec/docker/cli-plugins
WORKDIR /app
COPY target/ops-control-plane-1.0.0-SNAPSHOT.jar /app/app.jar
EXPOSE 8099
# Absolute jar path: compose sets working_dir=/workspace for docker CLI
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
