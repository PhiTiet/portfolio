package nl.personal.portfolio.domain;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record Skill(@NotBlank String name, @Min(1) @Max(10) int proficiency, @NotNull @Valid Icon icon) implements Comparable<Skill> {

    @Override
    public int compareTo(final Skill other) {
        return Integer.compare(proficiency, other.proficiency);
    }

    public int proficiencyPercentage() {
        return proficiency * 10;
    }
}
