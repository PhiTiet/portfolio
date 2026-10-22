package nl.personal.portfolio.core;

import nl.personal.portfolio.domain.HomePageDetails;
import nl.personal.portfolio.domain.config.career.CareerConfigProperties;
import nl.personal.portfolio.domain.config.recommendation.RecommendationConfigProperties;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.SpringBootVersion;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.LocalDate;
import java.time.Period;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

import static java.util.Comparator.reverseOrder;

@Service
public final class CareerService {

    private final Map<String, CareerConfigProperties> careerPropertiesByLocale;
    private final Clock clock;
    private final RecommendationConfigProperties recommendations;

    public CareerService(
            @Qualifier("englishCareerProperties") CareerConfigProperties englishCareerProperties,
            @Qualifier("dutchCareerProperties") CareerConfigProperties dutchCareerProperties,
            Clock clock,
            RecommendationConfigProperties recommendations) {
        this.careerPropertiesByLocale = Map.of(
                "en", englishCareerProperties,
                "nl", dutchCareerProperties
        );
        this.clock = clock;
        this.recommendations = recommendations;
    }

    public HomePageDetails getDetails() {
        var locale = LocaleContextHolder.getLocale().getLanguage();
        var properties = careerPropertiesByLocale.getOrDefault(locale, careerPropertiesByLocale.get("en"));
        var today = LocalDate.now(clock);
        return HomePageDetails.builder()
                .age(Math.toIntExact(ChronoUnit.YEARS.between(properties.getBirthday(), today)))
                .professionalProgrammerPeriod(Period.between(properties.getProfessionalCareerStartDate(), today))
                .programmerPeriod(Period.between(properties.getProgrammingStartDate(), today))
                .certificates(sortedDescending(properties.getCertificates()))
                .skills(sortedDescending(properties.getSkills()))
                .events(sortedDescending(properties.getEvents()))
                .hobbies(properties.getHobbies())
                .recommendations(recommendations.getItems())
                .springBootVersion(SpringBootVersion.getVersion())
                .javaVersion(System.getProperty("java.version"))
                .build();
    }

    private static <T extends Comparable<T>> List<T> sortedDescending(List<T> items) {
        return items.stream().sorted(reverseOrder()).toList();
    }
}
