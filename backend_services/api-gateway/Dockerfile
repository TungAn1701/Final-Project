FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY common-dto ./common-dto
COPY api-gateway ./api-gateway
COPY ingestion-service ./ingestion-service
COPY customer-service ./customer-service
RUN mvn clean package -pl api-gateway,common-dto -am -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/api-gateway/target/api-gateway-*.jar app.jar
EXPOSE 8000
ENTRYPOINT ["java", "-jar", "app.jar"]
