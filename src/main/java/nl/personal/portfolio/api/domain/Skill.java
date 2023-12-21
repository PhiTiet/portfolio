package nl.personal.portfolio.api.domain;

public record Skill(String name, Integer proficiency) implements Comparable<Skill> {
    @Override
    public int compareTo(Skill other) {
        return proficiency.compareTo(other.proficiency);
    }
}
