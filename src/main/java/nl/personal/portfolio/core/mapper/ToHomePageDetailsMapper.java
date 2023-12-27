package nl.personal.portfolio.core.mapper;

import nl.personal.portfolio.domain.HomePageDetails;
import nl.personal.portfolio.domain.Mapper;
import nl.personal.portfolio.domain.config.career.CareerProperties;
import org.springframework.stereotype.Component;

import static java.lang.Math.toIntExact;
import static java.time.LocalDate.now;
import static java.time.Period.between;
import static java.time.temporal.ChronoUnit.YEARS;
import static java.util.Comparator.reverseOrder;

@Component
public class ToHomePageDetailsMapper implements Mapper<CareerProperties, HomePageDetails> {

    @Override
    public HomePageDetails map(CareerProperties careerProperties) {
        return HomePageDetails.builder()
                .age(toIntExact(YEARS.between(careerProperties.getBirthday(), now())))
                .professionalProgrammerPeriod(between(careerProperties.getProfessionalCareerStartDate(), now()))
                .programmerPeriod(between(careerProperties.getProgrammingStartDate(), now()))
                .certificates(careerProperties.getCertificates().stream().sorted(reverseOrder()).toList())
                .skills(careerProperties.getSkills().stream().sorted(reverseOrder()).toList())
                .events(careerProperties.getEvents().stream().sorted(reverseOrder()).toList())
                .hobbies(careerProperties.getHobbies())
                .build();
    }
}
