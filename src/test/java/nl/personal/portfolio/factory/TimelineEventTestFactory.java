package nl.personal.portfolio.factory;

import java.time.LocalDate;

import nl.personal.portfolio.api.domain.TimelineEvent;

public class TimelineEventTestFactory {
    public static TimelineEvent defaultTimelineEvent(){
        return new TimelineEvent("title", "description", "icon", LocalDate.now().minusDays(1), LocalDate.now());
    }
}
