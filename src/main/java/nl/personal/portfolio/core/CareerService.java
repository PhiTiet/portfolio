package nl.personal.portfolio.core;

import nl.personal.portfolio.core.mapper.ToHomePageDetailsMapper;
import nl.personal.portfolio.domain.HomePageDetails;
import nl.personal.portfolio.domain.config.career.CareerProperties;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public final class CareerService {

    private final Map<String, CareerProperties> careerPropertiesByLocale;
    private final ToHomePageDetailsMapper toHomePageDetailsMapper;

    public CareerService(
            @Qualifier("englishCareerProperties") final CareerProperties englishCareerProperties,
            @Qualifier("dutchCareerProperties") final CareerProperties dutchCareerProperties,
            final ToHomePageDetailsMapper toHomePageDetailsMapper) {
        this.careerPropertiesByLocale = Map.of(
                "en", englishCareerProperties,
                "nl", dutchCareerProperties
        );
        this.toHomePageDetailsMapper = toHomePageDetailsMapper;
    }

    public HomePageDetails getDetails() {
        var locale = LocaleContextHolder.getLocale().getLanguage();
        var properties = careerPropertiesByLocale.getOrDefault(locale, careerPropertiesByLocale.get("en"));
        return toHomePageDetailsMapper.map(properties);
    }
}
