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
    @DisplayName("should return spring boot version")
    void springVersion() {
        assertThat(sut.springBootVersion()).isNotBlank();
    }

    @Test
    @DisplayName("should return java version")
    void javaVersion() {
        assertThat(sut.javaVersion()).isNotBlank();
    }

}
