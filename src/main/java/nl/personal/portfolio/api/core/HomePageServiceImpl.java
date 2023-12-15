package nl.personal.portfolio.api.core;

import nl.personal.portfolio.api.domain.HomePageDetails;
import nl.personal.portfolio.api.domain.config.career.CareerProperties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Period;
import java.time.temporal.ChronoUnit;

@Service
public class HomePageServiceImpl implements HomePageService {
    @Autowired
    private CareerProperties careerProperties;

    @Override
    public HomePageDetails getDetails() {
        return HomePageDetails.builder()
                .age(Math.toIntExact(ChronoUnit.YEARS.between(careerProperties.getBirthday(), LocalDate.now())))
                .professionalProgrammerPeriod(Period.between(careerProperties.getProfessionalCareerStartDate(), LocalDate.now()))
                .programmerPeriod(Period.between(careerProperties.getProgrammingStartDate(), LocalDate.now()))
                .certificates(careerProperties.getCertificates())
                .build();
    }

}
