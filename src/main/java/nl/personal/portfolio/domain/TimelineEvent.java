package nl.personal.portfolio.domain;

import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

public record TimelineEvent(
        String employer,
        String jobTitle,
        String description,
        Icon icon,
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
        return start + " → " + end;
    }
}
