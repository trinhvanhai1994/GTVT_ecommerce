# syntax=docker/dockerfile:1
# Jars are built once in deploy.ps1 (Maven container + named cache volume).
ARG MODULE
FROM eclipse-temurin:21-jre
ARG MODULE
WORKDIR /app
COPY ${MODULE}/target/${MODULE}-1.0.0-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
