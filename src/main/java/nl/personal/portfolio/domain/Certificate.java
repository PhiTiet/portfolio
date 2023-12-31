package nl.personal.portfolio.domain;

import jakarta.validation.constraints.NotNull;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public record Certificate(
        String title,
        String institution,
        @DateTimeFormat(pattern = "dd-MM-yyyy")
        LocalDate acquisitionDate) implements Comparable<Certificate> {

    public String formattedAcquisitionDate() {
        return acquisitionDate.format(DateTimeFormatter.ofPattern("MM-yyyy"));
    }

    @Override
    public int compareTo(@NotNull Certificate other) {
        return acquisitionDate.compareTo(other.acquisitionDate());
    }
}
