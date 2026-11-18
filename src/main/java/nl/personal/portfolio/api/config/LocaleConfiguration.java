package nl.personal.portfolio.api.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.i18n.AcceptHeaderLocaleResolver;

import java.util.List;
import java.util.Locale;

@Configuration
public class LocaleConfiguration {

    public static final Locale DUTCH = Locale.forLanguageTag("nl");

    @Bean
    public LocaleResolver localeResolver() {
        var resolver = new PathLocaleResolver();
        resolver.setSupportedLocales(List.of(Locale.ENGLISH, DUTCH));
        resolver.setDefaultLocale(Locale.ENGLISH);
        return resolver;
    }

    static final class PathLocaleResolver extends AcceptHeaderLocaleResolver {

        @Override
        public Locale resolveLocale(HttpServletRequest request) {
            var path = request.getRequestURI();
            if (path.equals("/nl") || path.startsWith("/nl/")) {
                return DUTCH;
            }
            return path.startsWith("/api/") ? super.resolveLocale(request) : Locale.ENGLISH;
        }
    }
}
