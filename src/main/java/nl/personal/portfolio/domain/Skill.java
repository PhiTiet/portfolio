package nl.personal.portfolio.domain;

public record Skill(String name, int proficiency, Icon icon) implements Comparable<Skill> {

    @Override
    public int compareTo(final Skill other) {
        return Integer.compare(proficiency, other.proficiency);
    }

    public int proficiencyPercentage() {
        return proficiency * 10;
    }
}
