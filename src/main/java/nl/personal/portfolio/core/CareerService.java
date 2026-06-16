package nl.personal.portfolio.core;

import nl.personal.portfolio.core.mapper.ToHomePageDetailsMapper;
import nl.personal.portfolio.domain.HomePageDetails;
import nl.personal.portfolio.domain.config.career.CareerProperties;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Service;

import java.util.Locale;
import java.util.Map;

@Service
public final class CareerService {

    private static final String DEFAULT_LANGUAGE = Locale.ENGLISH.getLanguage();
    private static final String DUTCH_LANGUAGE = Locale.of("nl").getLanguage();

    private final Map<String, CareerProperties> careerPropertiesByLocale;
    private final ToHomePageDetailsMapper toHomePageDetailsMapper;

    public CareerService(
            @Qualifier("englishCareerProperties") final CareerProperties englishCareerProperties,
            @Qualifier("dutchCareerProperties") final CareerProperties dutchCareerProperties,
            final ToHomePageDetailsMapper toHomePageDetailsMapper) {
        this.careerPropertiesByLocale = Map.of(
                DEFAULT_LANGUAGE, englishCareerProperties,
                DUTCH_LANGUAGE, dutchCareerProperties
        );
        this.toHomePageDetailsMapper = toHomePageDetailsMapper;
    }

    public HomePageDetails getDetails() {
        return getDetails(LocaleContextHolder.getLocale());
    }

    HomePageDetails getDetails(final Locale locale) {
        var language = locale.getLanguage();
        var properties = careerPropertiesByLocale.getOrDefault(language, careerPropertiesByLocale.get(DEFAULT_LANGUAGE));
        return toHomePageDetailsMapper.map(properties);
    }
}
