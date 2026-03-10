package nl.personal.portfolio.api.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.servlet.HandlerInterceptor;

public final class ContactRateLimitInterceptor implements HandlerInterceptor {

    private final ContactRateLimiter contactRateLimiter;

    public ContactRateLimitInterceptor(ContactRateLimiter contactRateLimiter) {
        this.contactRateLimiter = contactRateLimiter;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if ("POST".equalsIgnoreCase(request.getMethod())) {
            contactRateLimiter.checkLimit(request.getRemoteAddr());
        }
        return true;
    }
}
