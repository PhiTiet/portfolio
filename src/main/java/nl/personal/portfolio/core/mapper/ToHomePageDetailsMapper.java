package nl.personal.portfolio.core.mapper;

import lombok.RequiredArgsConstructor;
import nl.personal.portfolio.domain.HomePageDetails;
import nl.personal.portfolio.domain.config.career.CareerProperties;
import org.springframework.boot.info.BuildProperties;
import org.springframework.boot.info.GitProperties;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

import static java.lang.Math.toIntExact;
import static java.time.Period.between;
import static java.time.temporal.ChronoUnit.YEARS;
import static java.util.Comparator.reverseOrder;

@Component
@RequiredArgsConstructor
public final class ToHomePageDetailsMapper {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy");

    private final Clock clock;
    private final BuildProperties buildProperties;
    private final GitProperties gitProperties;

    public HomePageDetails map(final CareerProperties careerProperties) {
        var today = LocalDate.now(clock);
        return HomePageDetails.builder()
                .age(toIntExact(YEARS.between(careerProperties.getBirthday(), today)))
                .professionalProgrammerPeriod(between(careerProperties.getProfessionalCareerStartDate(), today))
                .programmerPeriod(between(careerProperties.getProgrammingStartDate(), today))
                .certificates(careerProperties.getCertificates().stream().sorted(reverseOrder()).toList())
                .skills(careerProperties.getSkills().stream().sorted(reverseOrder()).toList())
                .events(careerProperties.getEvents().stream().sorted(reverseOrder()).toList())
                .hobbies(careerProperties.getHobbies())
                .imageVersion(buildProperties.getTime().atZone(ZoneId.systemDefault()).format(DATE_FORMATTER))
                .lastUpdated(gitProperties.getCommitTime().atZone(ZoneId.systemDefault()).format(DATE_FORMATTER))
                .build();
    }
}
