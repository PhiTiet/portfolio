package nl.personal.portfolio.domain;

public record Skill(String name, int proficiency, Icon icon) {

    public int proficiencyPercentage() {
        return proficiency * 10;
    }
}
