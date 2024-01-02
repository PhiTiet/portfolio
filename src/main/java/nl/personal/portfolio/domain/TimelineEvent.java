package nl.personal.portfolio.domain;

import lombok.Builder;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

@Builder(toBuilder = true)
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
        final var formatter = DateTimeFormatter.ofPattern("MM-yyyy");
        final var end = end().isPresent() ? end().get().format(formatter) : "current";
        final var start = start().format(formatter);
        return start + " → " + end;
    }
}
