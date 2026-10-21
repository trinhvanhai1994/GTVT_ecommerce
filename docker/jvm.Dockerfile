# syntax=docker/dockerfile:1
# JAR must exist on host: ./scripts/ops-deploy.sh rebuild runs mvn -pl <module> -am first.
ARG MODULE
ARG JAR_BUILD_ID=0
FROM eclipse-temurin:21-jre
ARG MODULE
ARG JAR_BUILD_ID
WORKDIR /app
COPY ${MODULE}/target/${MODULE}-1.0.0-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
