package nl.personal.portfolio.factory;

import nl.personal.portfolio.api.domain.Skill;

public class SkillTestFactory {
    public static Skill defaultSkill(){
        return new Skill("skillName", 10);
    }
}
