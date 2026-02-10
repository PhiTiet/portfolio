package nl.personal.portfolio.domain;

import lombok.Builder;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

import static nl.personal.portfolio.domain.DatePatterns.DISPLAY_FORMAT;
import static nl.personal.portfolio.domain.DatePatterns.INPUT_FORMAT;

@Builder(toBuilder = true)
public record TimelineEvent(
        String employer,
        String jobTitle,
        String description,
        Icon icon,
        @DateTimeFormat(pattern = INPUT_FORMAT)
        LocalDate start,
        @DateTimeFormat(pattern = INPUT_FORMAT)
        LocalDate end)
        implements Comparable<TimelineEvent> {

    @Override
    public int compareTo(final TimelineEvent other) {
        return start.compareTo(other.start);
    }

    public String workPeriod() {
        var endText = end != null ? end.format(DISPLAY_FORMAT) : "current";
        return start.format(DISPLAY_FORMAT) + " \u2192 " + endText;
    }
}
