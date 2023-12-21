package nl.personal.portfolio.factory;

import nl.personal.portfolio.domain.TimelineEvent;

import java.time.LocalDate;
import java.util.Optional;

public class TimelineEventTestFactory {
    public static TimelineEvent defaultTimelineEvent() {
        return new TimelineEvent("employer", "jobTitle", "description", "icon", LocalDate.now().minusDays(1), Optional.of(LocalDate.now()));
    }
}
