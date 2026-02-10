package nl.personal.portfolio.domain;

import nl.jqno.equalsverifier.EqualsVerifier;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static nl.personal.portfolio.factory.SkillTestFactory.defaultSkill;
import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Skill")
class SkillTest {

    private final Skill sut = defaultSkill();

    @Test
    @DisplayName("should satisfy equals and hashCode contract")
    void equalsAndHashCode() {
        EqualsVerifier.forClass(Skill.class).verify();
    }

    @Test
    @DisplayName("should calculate proficiency percentage as proficiency times 10")
    void proficiencyPercentage_returnsCorrectValue() {
        assertThat(sut.proficiencyPercentage()).isEqualTo(sut.proficiency() * 10);
    }

}
