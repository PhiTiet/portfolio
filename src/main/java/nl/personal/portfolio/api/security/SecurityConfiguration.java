package nl.personal.portfolio.api.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.web.util.matcher.OrRequestMatcher;

@Configuration
@EnableWebSecurity
public class SecurityConfiguration {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {

        final var anonymousRequestMatcher = new OrRequestMatcher(
                requestMatcher("/"),
                requestMatcher("/home/**"),
                requestMatcher("/static/**")
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

    private AntPathRequestMatcher requestMatcher(String pattern) {
        return new AntPathRequestMatcher(pattern);
    }
}
