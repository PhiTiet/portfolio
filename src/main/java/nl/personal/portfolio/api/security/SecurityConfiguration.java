package nl.personal.portfolio.api.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.security.web.util.matcher.OrRequestMatcher;

import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;

@Configuration(proxyBeanMethods = false)
@EnableWebSecurity
public final class SecurityConfiguration {

    private static final PathPatternRequestMatcher CONTACT_API = PathPatternRequestMatcher.pathPattern("/api/contact");
    private static final String CONTENT_SECURITY_POLICY = "default-src 'self'; "
            + "script-src 'self' 'unsafe-eval' https://cdn.jsdelivr.net https://kit.fontawesome.com https://ka-p.fontawesome.com; "
            + "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://ka-p.fontawesome.com https://ka-f.fontawesome.com; "
            + "font-src 'self' https://fonts.gstatic.com https://ka-p.fontawesome.com https://ka-f.fontawesome.com; "
            + "img-src 'self' data:; "
            + "connect-src 'self' https://ka-p.fontawesome.com https://ka-f.fontawesome.com https://cdn.jsdelivr.net";

    @Bean
    public SecurityFilterChain securityFilterChain(final HttpSecurity httpSecurity) throws Exception {

        var anonymousRequestMatcher = new OrRequestMatcher(
                PathPatternRequestMatcher.pathPattern("/"),
                PathPatternRequestMatcher.pathPattern("/home/**"),
                PathPatternRequestMatcher.pathPattern("/static/**"),
                PathPatternRequestMatcher.pathPattern("/*.css"),
                PathPatternRequestMatcher.pathPattern("/favicon.ico"),
                PathPatternRequestMatcher.pathPattern("/images/**"),
                PathPatternRequestMatcher.pathPattern("/pdf/**"),
                PathPatternRequestMatcher.pathPattern("/*.js"),
                PathPatternRequestMatcher.pathPattern("/webjars/**"),
                PathPatternRequestMatcher.pathPattern("/robots.txt"),
                PathPatternRequestMatcher.pathPattern("/sitemap.xml"),
                CONTACT_API
        );

        return httpSecurity
                .csrf(csrf -> csrf.ignoringRequestMatchers(CONTACT_API))
                .headers(headers -> {
                    headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin);
                    headers.httpStrictTransportSecurity(HeadersConfigurer.HstsConfig::disable);
                    headers.referrerPolicy(referrer -> referrer
                            .policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN));
                    headers.permissionsPolicyHeader(permissions -> permissions
                            .policy("camera=(), microphone=(), geolocation=(), payment=()"));
                    headers.contentSecurityPolicy(csp -> csp.policyDirectives(CONTENT_SECURITY_POLICY));
                })
                .authorizeHttpRequests(authorization -> authorization
                        .requestMatchers(anonymousRequestMatcher).permitAll()
                        .anyRequest().authenticated())
                .build();
    }
}
