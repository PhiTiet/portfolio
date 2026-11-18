package nl.personal.portfolio.core;

import nl.personal.portfolio.config.CareerProperties;
import nl.personal.portfolio.config.RecommendationProperties;
import nl.personal.portfolio.domain.HomePageDetails;
import org.springframework.boot.SpringBootVersion;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.Locale;

import static java.util.Comparator.reverseOrder;

@Service
public final class CareerService {

    private final CareerProperties career;
    private final RecommendationProperties recommendations;
    private final Clock clock;

    public CareerService(CareerProperties career, RecommendationProperties recommendations, Clock clock) {
        this.career = career;
        this.recommendations = recommendations;
        this.clock = clock;
    }

    public HomePageDetails getDetails(Locale locale) {
        var today = LocalDate.now(clock);
        return new HomePageDetails(
                Period.between(career.professionalCareerStartDate(), today),
                sortedDescending(career.certificates(locale)),
                career.hobbies(locale),
                sortedDescending(career.skills()),
                sortedDescending(career.events(locale)),
                sortedDescending(career.contributions(locale)),
                recommendations.items(),
                SpringBootVersion.getVersion(),
                System.getProperty("java.version"));
    }

    private static <T extends Comparable<T>> List<T> sortedDescending(List<T> items) {
        return items.stream().sorted(reverseOrder()).toList();
    }
}
