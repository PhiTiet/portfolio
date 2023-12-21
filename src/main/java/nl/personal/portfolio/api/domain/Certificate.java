package nl.personal.portfolio.api.domain;

import jakarta.validation.constraints.NotNull;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public record Certificate(
        String title,
        String institution,
        LocalDate acquisitionDate) implements Comparable<Certificate> {

    public String formattedAcquisitionDate() {
        return acquisitionDate.format(DateTimeFormatter.ofPattern("MM-yyyy"));
    }

    @Override
    public int compareTo(@NotNull Certificate other) {
        return acquisitionDate.compareTo(other.acquisitionDate());
    }
}
