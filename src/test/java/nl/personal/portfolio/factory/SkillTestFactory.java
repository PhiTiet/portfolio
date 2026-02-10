package nl.personal.portfolio.factory;

import nl.personal.portfolio.domain.Icon;
import nl.personal.portfolio.domain.Skill;

public class SkillTestFactory {
    public static Skill defaultSkill() {
        return new Skill("skillName", 10, new Icon("fa-solid fa-code", "color:#2dd4bf"));
    }
}
