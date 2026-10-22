package nl.personal.portfolio.domain;

import java.util.List;

public record CareerHighlight(
        String summary,
        List<String> responsibilities,
        List<Source> coverage) {

    public CareerHighlight {
        responsibilities = responsibilities == null ? List.of() : List.copyOf(responsibilities);
        coverage = coverage == null ? List.of() : List.copyOf(coverage);
    }

    public record Source(String publisher, String title, String url) {
    }
}
