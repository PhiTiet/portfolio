package nl.personal.portfolio.domain;

public record Skill(String name, Integer proficiency, Icon icon) implements Comparable<Skill> {
    @Override
    public int compareTo(Skill other) {
        return proficiency.compareTo(other.proficiency);
    }

    public int getProficiencyPercentage() {
        return proficiency * 10;
    }
}
