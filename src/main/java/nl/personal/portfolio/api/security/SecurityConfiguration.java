package nl.personal.portfolio.api.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.OrRequestMatcher;

import java.time.Clock;

import static org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher.pathPattern;

@Configuration
@EnableWebSecurity
public class SecurityConfiguration {

    @Bean
    public SecurityFilterChain securityFilterChain(final HttpSecurity httpSecurity) throws Exception {

        final var anonymousRequestMatcher = new OrRequestMatcher(
                pathPattern("/"),
                pathPattern("/home/**"),
                pathPattern("/static/**"),
                pathPattern("/*.css"),
                pathPattern("/favicon.ico"),
                pathPattern("/images/**"),
                pathPattern("/pdf/**"),
                pathPattern("/*.js"),
                pathPattern("/webjars/**")
        );

        return httpSecurity
                .headers(headers -> headers
                        .frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin)
                        .httpStrictTransportSecurity(HeadersConfigurer.HstsConfig::disable))
                .authorizeHttpRequests(authorization -> authorization
                        .requestMatchers(anonymousRequestMatcher).permitAll()
                        .anyRequest().authenticated())
                .build();

    }

    @Bean
    Clock clock() {
        return Clock.systemDefaultZone();
    }
}
