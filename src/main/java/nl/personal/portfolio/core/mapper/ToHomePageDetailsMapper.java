package nl.personal.portfolio.core.mapper;

import lombok.RequiredArgsConstructor;
import nl.personal.portfolio.domain.HomePageDetails;
import nl.personal.portfolio.domain.config.career.CareerProperties;
import nl.personal.portfolio.domain.config.recommendation.RecommendationConfigProperties;
import org.springframework.boot.SpringBootVersion;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.LocalDate;
import java.util.List;

import static java.lang.Math.toIntExact;
import static java.time.Period.between;
import static java.time.temporal.ChronoUnit.YEARS;
import static java.util.Comparator.reverseOrder;

@Component
@RequiredArgsConstructor
public final class ToHomePageDetailsMapper {

    private final Clock clock;
    private final RecommendationConfigProperties recommendationConfigProperties;

    public HomePageDetails map(final CareerProperties careerProperties) {
        var today = LocalDate.now(clock);
        return HomePageDetails.builder()
                .age(toIntExact(YEARS.between(careerProperties.getBirthday(), today)))
                .professionalProgrammerPeriod(between(careerProperties.getProfessionalCareerStartDate(), today))
                .programmerPeriod(between(careerProperties.getProgrammingStartDate(), today))
                .certificates(sortedDescending(careerProperties.getCertificates()))
                .skills(sortedDescending(careerProperties.getSkills()))
                .events(sortedDescending(careerProperties.getEvents()))
                .hobbies(careerProperties.getHobbies())
                .recommendations(recommendationConfigProperties.getItems())
                .springBootVersion(SpringBootVersion.getVersion())
                .javaVersion(System.getProperty("java.version"))
                .build();
    }

    private <T extends Comparable<T>> List<T> sortedDescending(final List<T> items) {
        return items.stream().sorted(reverseOrder()).toList();
    }
}
