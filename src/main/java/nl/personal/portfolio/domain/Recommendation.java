package nl.personal.portfolio.domain;

import java.time.LocalDate;

public record Recommendation(String quote, String authorName, String authorInitials, String authorRole,
                              String letterPdf, LocalDate date) {
}
