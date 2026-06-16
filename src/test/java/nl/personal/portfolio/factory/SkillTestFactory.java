package nl.personal.portfolio.factory;

import nl.personal.portfolio.domain.Icon;
import nl.personal.portfolio.domain.Skill;

public final class SkillTestFactory {

    private SkillTestFactory() {
    }

    public static Skill defaultSkill() {
        return skill("skillName", 10);
    }

    public static Skill skill(final String name, final int proficiency) {
        return new Skill(name, proficiency, new Icon("fa-solid fa-code", "color:#2dd4bf"));
    }
}
