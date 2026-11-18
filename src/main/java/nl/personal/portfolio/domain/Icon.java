package nl.personal.portfolio.domain;

import jakarta.validation.constraints.Pattern;

public record Icon(@Pattern(regexp = "(solid|brands)/[a-z0-9-]+") String name, String color, String animation) {

    public String symbolId() {
        return name.replace('/', '-');
    }
}
