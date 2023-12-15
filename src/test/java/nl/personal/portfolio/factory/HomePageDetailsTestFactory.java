package nl.personal.portfolio.factory;

import nl.personal.portfolio.api.domain.HomePageDetails;

import java.time.Period;

public class HomePageDetailsTestFactory {
    public static HomePageDetails homePageDetails() {
        return HomePageDetails.builder().age(69).programmerPeriod(Period.ofYears(5)).professionalProgrammerPeriod(Period.ofYears(4)).build();
    }
}
