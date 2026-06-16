package nl.personal.portfolio.core.mapper;

import nl.personal.portfolio.domain.Certificate;
import nl.personal.portfolio.domain.HomePageDetails;
import nl.personal.portfolio.domain.Skill;
import nl.personal.portfolio.domain.TimelineEvent;
import nl.personal.portfolio.domain.config.career.CareerProperties;
import nl.personal.portfolio.domain.config.recommendation.RecommendationConfigProperties;
import org.springframework.boot.SpringBootVersion;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.function.Function;

import static java.lang.Math.toIntExact;
import static java.time.Period.between;
import static java.time.temporal.ChronoUnit.YEARS;

@Component
public final class ToHomePageDetailsMapper {

    private final Clock clock;
    private final RecommendationConfigProperties recommendationConfigProperties;

    public ToHomePageDetailsMapper(
            final Clock clock,
            final RecommendationConfigProperties recommendationConfigProperties) {
        this.clock = clock;
        this.recommendationConfigProperties = recommendationConfigProperties;
    }

    public HomePageDetails map(final CareerProperties careerProperties) {
        var today = LocalDate.now(clock);
        return new HomePageDetails(
                toIntExact(YEARS.between(careerProperties.getBirthday(), today)),
                between(careerProperties.getProfessionalCareerStartDate(), today),
                between(careerProperties.getProgrammingStartDate(), today),
                sortedDescending(careerProperties.getCertificates(), Certificate::acquisitionDate),
                careerProperties.getHobbies(),
                sortedDescending(careerProperties.getSkills(), Skill::proficiency),
                sortedDescending(careerProperties.getEvents(), TimelineEvent::start),
                recommendationConfigProperties.getItems(),
                SpringBootVersion.getVersion(),
                System.getProperty("java.version")
        );
    }

    private static <T, U extends Comparable<? super U>> List<T> sortedDescending(
            final List<T> items,
            final Function<T, U> keyExtractor) {
        return items.stream()
                .sorted(Comparator.comparing(keyExtractor).reversed())
                .toList();
    }
}
