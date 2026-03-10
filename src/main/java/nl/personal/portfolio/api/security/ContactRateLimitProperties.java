package nl.personal.portfolio.api.security;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

import java.time.Duration;

@ConfigurationProperties(prefix = "portfolio.contact.rate-limit")
public record ContactRateLimitProperties(
        @DefaultValue("5") int maxRequests,
        @DefaultValue("10m") Duration window) {

    public ContactRateLimitProperties {
        if (maxRequests < 1) {
            throw new IllegalArgumentException("portfolio.contact.rate-limit.max-requests must be greater than 0");
        }
        if (window == null || window.isZero() || window.isNegative()) {
            throw new IllegalArgumentException("portfolio.contact.rate-limit.window must be greater than 0");
        }
    }
}
