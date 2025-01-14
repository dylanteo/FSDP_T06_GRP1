package com.test.test;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Apply to all paths
                .allowedOrigins("https://www.globalsqa.com", "http://localhost:3000") // Allow GlobalsQA and localhost for development
                .allowedMethods("GET", "POST", "PUT", "DELETE") // Allowed methods
                .allowCredentials(true); // If needed for cookie-based authentication
    }
}

