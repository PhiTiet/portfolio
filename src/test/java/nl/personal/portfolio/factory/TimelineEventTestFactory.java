package nl.personal.portfolio.factory;

import java.time.LocalDate;
import java.util.Optional;

import nl.personal.portfolio.api.domain.TimelineEvent;

public class TimelineEventTestFactory {
    public static TimelineEvent defaultTimelineEvent(){
        return new TimelineEvent("employer", "jobTitle", "description", "icon", LocalDate.now().minusDays(1), Optional.of(LocalDate.now()));
    }
}
