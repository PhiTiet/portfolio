package nl.personal.portfolio.domain;

import java.time.LocalDate;

public record Contribution(String repository, String title, String url, LocalDate merged) implements Comparable<Contribution> {

    @Override
    public int compareTo(final Contribution other) {
        return merged.compareTo(other.merged);
    }
}
