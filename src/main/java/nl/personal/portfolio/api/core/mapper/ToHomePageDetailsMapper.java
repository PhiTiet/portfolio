package nl.personal.portfolio.api.core.mapper;

import nl.personal.portfolio.api.domain.HomePageDetails;
import nl.personal.portfolio.api.domain.Mapper;
import nl.personal.portfolio.api.domain.config.career.CareerProperties;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.Period;

import static java.lang.Math.toIntExact;
import static java.time.temporal.ChronoUnit.YEARS;

@Component
public class ToHomePageDetailsMapper implements Mapper<CareerProperties, HomePageDetails> {

    @Override
    public HomePageDetails map(CareerProperties careerProperties) {
        return HomePageDetails.builder()
                .age(toIntExact(YEARS.between(careerProperties.getBirthday(), LocalDate.now())))
                .professionalProgrammerPeriod(Period.between(careerProperties.getProfessionalCareerStartDate(), LocalDate.now()))
                .programmerPeriod(Period.between(careerProperties.getProgrammingStartDate(), LocalDate.now()))
                .certificates(careerProperties.getCertificates())
                .build();
    }
}
