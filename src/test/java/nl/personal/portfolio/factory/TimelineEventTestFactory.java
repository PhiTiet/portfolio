package nl.personal.portfolio.factory;

import nl.personal.portfolio.domain.TimelineEvent;

import java.time.LocalDate;

import static nl.personal.portfolio.factory.IconTestFactory.defaultIcon;

public final class TimelineEventTestFactory {

    public static final LocalDate DEFAULT_START_DATE = LocalDate.of(2024, 1, 1);
    public static final LocalDate DEFAULT_END_DATE = LocalDate.of(2024, 12, 31);

    private TimelineEventTestFactory() {
    }

    public static TimelineEvent defaultTimelineEvent() {
        return timelineEvent("employer", DEFAULT_START_DATE);
    }

    public static TimelineEvent timelineEvent(final String employer, final LocalDate start) {
        return new TimelineEvent(employer, "jobTitle", "description", defaultIcon(), start, DEFAULT_END_DATE);
    }
}
