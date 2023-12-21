package nl.personal.portfolio.factory;

import nl.personal.portfolio.domain.TimelineEvent;

import java.time.LocalDate;
import java.util.Optional;

import static nl.personal.portfolio.factory.IconTestFactory.defaultIcon;

public class TimelineEventTestFactory {
    public static TimelineEvent defaultTimelineEvent() {
        return new TimelineEvent("employer", "jobTitle", "description", defaultIcon(), LocalDate.now().minusDays(1), Optional.of(LocalDate.now()));
    }
}
