package nl.personal.portfolio.api.security;

import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@ConditionalOnBean(ContactRateLimiter.class)
public class ContactRateLimitConfiguration implements WebMvcConfigurer {

    private final ContactRateLimiter contactRateLimiter;

    public ContactRateLimitConfiguration(ContactRateLimiter contactRateLimiter) {
        this.contactRateLimiter = contactRateLimiter;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new ContactRateLimitInterceptor(contactRateLimiter))
                .addPathPatterns("/api/contact");
    }
}
