package nl.personal.portfolio.domain;

import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

import static nl.personal.portfolio.domain.DatePatterns.DISPLAY_FORMAT;
import static nl.personal.portfolio.domain.DatePatterns.INPUT_FORMAT;

public record Certificate(
        String title,
        String institution,
        @DateTimeFormat(pattern = INPUT_FORMAT)
        LocalDate acquisitionDate) implements Comparable<Certificate> {

    public String formattedAcquisitionDate() {
        return acquisitionDate.format(DISPLAY_FORMAT);
    }

    @Override
    public int compareTo(final Certificate other) {
        return acquisitionDate.compareTo(other.acquisitionDate());
    }
}
