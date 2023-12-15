package nl.personal.portfolio.api.domain.config.career;

import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

public record Certificate (
        String title,
        String institution,
        @DateTimeFormat(pattern = "dd-MM-yyyy")
        LocalDate acquisitionDate) {
}
