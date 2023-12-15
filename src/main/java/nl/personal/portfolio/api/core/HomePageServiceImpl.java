package nl.personal.portfolio.api.core;

import nl.personal.portfolio.api.domain.HomePageDetails;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Period;
import java.time.temporal.ChronoUnit;

@Service
public class HomePageServiceImpl implements HomePageService {
    private static final LocalDate MY_BIRTHDAY = LocalDate.of(1999, 12, 9);
    private static final LocalDate STARTED_PROGRAMMING_DATE = LocalDate.of(2018, 7, 1);
    private static final LocalDate STARTED_PROGRAMMING_PROFESSIONALLY_DATE = LocalDate.of(2021, 9, 1);

    @Override
    public HomePageDetails getDetails() {
        return HomePageDetails.builder()
                .age(Math.toIntExact(ChronoUnit.YEARS.between(MY_BIRTHDAY, LocalDate.now())))
                .professionalProgrammerPeriod(Period.between(STARTED_PROGRAMMING_PROFESSIONALLY_DATE, LocalDate.now()))
                .programmerPeriod(Period.between(STARTED_PROGRAMMING_DATE, LocalDate.now()))
                .build();
    }

}
