package nl.personal.portfolio.domain;

import nl.jqno.equalsverifier.EqualsVerifier;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static nl.personal.portfolio.factory.HomePageDetailsTestFactory.defaultHomePageDetails;
import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("HomePageDetails")
class HomePageDetailsTest {

    private final HomePageDetails sut = defaultHomePageDetails();

    @Test
    @DisplayName("should satisfy equals and hashCode contract")
    void equalsAndHashCode() {
        EqualsVerifier.forClass(HomePageDetails.class).verify();
    }

    @Test
    @DisplayName("should return current spring boot version")
    void springVersion() {
        assertThat(sut.currentSpringBootVersion()).isNotBlank();
    }

    @Test
    @DisplayName("should return current java version")
    void javaVersion() {
        assertThat(sut.currentJavaVersion()).isNotBlank();
    }

}
