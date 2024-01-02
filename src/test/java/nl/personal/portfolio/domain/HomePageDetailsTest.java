package nl.personal.portfolio.domain;

import nl.jqno.equalsverifier.EqualsVerifier;
import org.junit.jupiter.api.Test;
import org.springframework.boot.SpringBootVersion;

import static nl.personal.portfolio.factory.HomePageDetailsTestFactory.defaultHomePageDetails;
import static org.assertj.core.api.Assertions.assertThat;

class HomePageDetailsTest {
    private final HomePageDetails sut = defaultHomePageDetails();

    @Test
    void equalsAndHashCode() {
        EqualsVerifier.forClass(HomePageDetails.class).verify();
    }

    @Test
    void springVersion() {
        assertThat(sut.currentSpringBootVersion()).isEqualTo(SpringBootVersion.getVersion());
    }

    @Test
    void javaVersion() {
        assertThat(sut.currentJavaVersion()).isEqualTo(System.getProperty("java.version"));
    }

}
