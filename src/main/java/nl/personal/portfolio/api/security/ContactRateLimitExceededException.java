package nl.personal.portfolio.api.security;

public final class ContactRateLimitExceededException extends RuntimeException {

    private final long retryAfterSeconds;

    public ContactRateLimitExceededException(long retryAfterSeconds) {
        super("Contact rate limit exceeded");
        this.retryAfterSeconds = retryAfterSeconds;
    }

    public long getRetryAfterSeconds() {
        return retryAfterSeconds;
    }
}
