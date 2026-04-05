package com.learnhub.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI learnhubOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("LearnHub API")
                        .description("LearnHub 온라인 학습 플랫폼 API")
                        .version("v1.0.0")
                        .contact(new Contact()
                                .name("LearnHub Team")
                                .email("dev@learnhub.com")));
    }
}
