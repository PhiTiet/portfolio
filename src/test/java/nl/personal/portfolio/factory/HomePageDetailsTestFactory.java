package nl.personal.portfolio.factory;

import nl.personal.portfolio.domain.HomePageDetails;

import java.time.Period;

public class HomePageDetailsTestFactory {
    public static HomePageDetails defaultHomePageDetails() {
        return HomePageDetails.builder().age(69).programmerPeriod(Period.ofYears(5)).professionalProgrammerPeriod(Period.ofYears(4)).build();
    }
}
