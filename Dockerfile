FROM node:22-alpine AS frontend-build

WORKDIR /app
COPY frontend/ ./frontend/

WORKDIR /app/frontend
RUN npm ci
RUN npm run build

FROM maven:3.9.9-eclipse-temurin-21 AS backend-build

WORKDIR /app

COPY pom.xml .
COPY src ./src

COPY --from=frontend-build /app/src/main/resources/static ./src/main/resources/static

RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=backend-build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
