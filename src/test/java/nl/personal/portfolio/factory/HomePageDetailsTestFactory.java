package nl.personal.portfolio.factory;

import nl.personal.portfolio.domain.HomePageDetails;

import java.time.Period;
import java.util.List;

public final class HomePageDetailsTestFactory {

    private HomePageDetailsTestFactory() {
    }

    public static HomePageDetails defaultHomePageDetails() {
        return new HomePageDetails(
                69,
                Period.ofYears(4),
                Period.ofYears(5),
                List.of(),
                List.of(),
                List.of(),
                List.of(),
                List.of(),
                "3.0.0",
                "21"
        );
    }
}
