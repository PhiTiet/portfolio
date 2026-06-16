package nl.personal.portfolio.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.i18n.CookieLocaleResolver;
import org.springframework.web.servlet.i18n.LocaleChangeInterceptor;

import java.util.Locale;

@Configuration(proxyBeanMethods = false)
public final class LocaleConfiguration implements WebMvcConfigurer {

    private static final String LANGUAGE_PARAMETER = "lang";

    @Bean
    public LocaleResolver localeResolver() {
        var resolver = new CookieLocaleResolver(LANGUAGE_PARAMETER);
        resolver.setDefaultLocale(Locale.ENGLISH);
        return resolver;
    }

    @Override
    public void addInterceptors(final InterceptorRegistry registry) {
        var interceptor = new LocaleChangeInterceptor();
        interceptor.setParamName(LANGUAGE_PARAMETER);
        registry.addInterceptor(interceptor);
    }
}
