package nl.personal.portfolio.factory;

import nl.personal.portfolio.domain.HomePageDetails;

import java.time.Period;
import java.util.List;

public class HomePageDetailsTestFactory {

    public static HomePageDetails defaultHomePageDetails() {
        return HomePageDetails.builder()
                .age(69)
                .programmerPeriod(Period.ofYears(5))
                .professionalProgrammerPeriod(Period.ofYears(4))
                .certificates(List.of())
                .hobbies(List.of())
                .skills(List.of())
                .events(List.of())
                .build();
    }
}
