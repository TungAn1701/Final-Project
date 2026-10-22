FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY common-dto ./common-dto
COPY api-gateway ./api-gateway
COPY ingestion-service ./ingestion-service
COPY customer-service ./customer-service
RUN mvn clean package -pl ingestion-service,common-dto -am -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/ingestion-service/target/ingestion-service-*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
