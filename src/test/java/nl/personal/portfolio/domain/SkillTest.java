package nl.personal.portfolio.domain;

import nl.jqno.equalsverifier.EqualsVerifier;
import org.junit.jupiter.api.Test;

import static nl.personal.portfolio.factory.SkillTestFactory.defaultSkill;
import static org.assertj.core.api.Assertions.assertThat;

class SkillTest {
    private final Skill sut = defaultSkill();

    @Test
    void equalsAndHashCode() {
        EqualsVerifier.forClass(Skill.class).verify();
    }

    @Test
    void percentage() {
        assertThat(sut.getProficiencyPercentage()).isEqualTo(sut.proficiency() * 10);
    }

}
