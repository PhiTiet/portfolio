package nl.personal.portfolio.api.domain;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

import org.springframework.format.annotation.DateTimeFormat;

public record TimelineEvent(
        String employer,
        String jobTitle,
        String description,
        String iconHtmlClass,
        @DateTimeFormat(pattern = "dd-MM-yyyy")
        LocalDate start,
        @DateTimeFormat(pattern = "dd-MM-yyyy")
        Optional<LocalDate> end)
        implements Comparable<TimelineEvent> {
    @Override
    public int compareTo(TimelineEvent other) {
        return start.compareTo(other.start);
    }

    public String getWorkPeriod() {
        var formatter = DateTimeFormatter.ofPattern("MM-yyyy");
        var end = end().isPresent() ? end().get().format(formatter) : "current";
        var start = start().format(formatter);
        return end + " - " + start;
    }
}
