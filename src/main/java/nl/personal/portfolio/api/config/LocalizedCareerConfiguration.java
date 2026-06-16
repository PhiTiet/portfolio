package nl.personal.portfolio.api.config;

import nl.personal.portfolio.domain.config.career.CareerConfigProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
public final class LocalizedCareerConfiguration {

    @Bean
    @ConfigurationProperties(prefix = "career-en")
    public CareerConfigProperties englishCareerProperties() {
        return new CareerConfigProperties();
    }

    @Bean
    @ConfigurationProperties(prefix = "career-nl")
    public CareerConfigProperties dutchCareerProperties() {
        return new CareerConfigProperties();
    }
}
