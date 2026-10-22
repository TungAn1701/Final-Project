package com.smartinsole.ingestion.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Smart Insole - Sensor Ingestion API")
                        .version("1.0.0")
                        .description("API Documentation for FSR Pressure Streaming, 16-Byte BLE Packet Decoding, and Gait Segmentation."));
    }
}
