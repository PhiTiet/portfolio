package nl.personal.portfolio.api.security;

import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Component
public final class ContactRateLimiter {

    private final Clock clock;
    private final ContactRateLimitProperties properties;
    private final Map<String, RateLimitWindow> windows = new HashMap<>();

    public ContactRateLimiter(Clock clock, ContactRateLimitProperties properties) {
        this.clock = clock;
        this.properties = properties;
    }

    public synchronized void checkLimit(String clientKey) {
        var now = Instant.now(clock);
        windows.entrySet().removeIf(entry -> !entry.getValue().expiresAt().isAfter(now));

        var normalizedClientKey = normalizeClientKey(clientKey);
        var currentWindow = windows.get(normalizedClientKey);

        if (currentWindow == null) {
            windows.put(normalizedClientKey, new RateLimitWindow(1, now.plus(properties.window())));
            return;
        }

        if (currentWindow.requestCount() >= properties.maxRequests()) {
            throw new ContactRateLimitExceededException(retryAfterSeconds(now, currentWindow.expiresAt()));
        }

        windows.put(normalizedClientKey, currentWindow.increment());
    }

    private String normalizeClientKey(String clientKey) {
        if (clientKey == null || clientKey.isBlank()) {
            return "unknown";
        }
        return clientKey;
    }

    private long retryAfterSeconds(Instant now, Instant expiresAt) {
        return Math.max(1L, Duration.between(now, expiresAt).toSeconds());
    }

    private record RateLimitWindow(int requestCount, Instant expiresAt) {

        private RateLimitWindow increment() {
            return new RateLimitWindow(requestCount + 1, expiresAt);
        }
    }
}
