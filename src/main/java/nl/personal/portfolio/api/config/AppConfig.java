package nl.personal.portfolio.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

import java.time.Clock;

@Configuration
public class AppConfig {

    @Bean
    Clock clock() {
        return Clock.systemDefaultZone();
    }

    @Bean
    RestClient.Builder restClientBuilder() {
        return RestClient.builder();
    }
}
