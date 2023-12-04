package nl.personal.portfolio.api.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.web.util.matcher.OrRequestMatcher;

@Configuration
@EnableWebSecurity
public class SecurityConfiguration {

    @Bean
    public SecurityFilterChain securityFilterChain (HttpSecurity httpSecurity) throws Exception {

        var anonymousRequestMatcher = new OrRequestMatcher(
                requestMatcher("/hello/**"),
                requestMatcher("/anonymous/**")
        );

        return httpSecurity
                .authorizeHttpRequests(authorization ->
                        authorization
                                .requestMatchers(anonymousRequestMatcher).anonymous()
                                .anyRequest().authenticated())
                .build();

    }

    private AntPathRequestMatcher requestMatcher(String pattern){ return new AntPathRequestMatcher((pattern));}
}
