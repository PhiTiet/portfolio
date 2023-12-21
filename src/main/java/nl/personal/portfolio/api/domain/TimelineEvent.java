package nl.personal.portfolio.api.domain;

import java.time.LocalDate;

public record TimelineEvent(String title, String description, String iconHtmlClass, LocalDate start, LocalDate end)
        implements Comparable<TimelineEvent>  {
    @Override
    public int compareTo(TimelineEvent other) {
        return start.compareTo(other.start);
    }
}
