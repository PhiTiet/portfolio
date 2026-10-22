package nl.personal.portfolio.domain;

import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class CareerHighlightTest {

    @Test
    void missingCollectionsBecomeEmpty() {
        var highlight = new CareerHighlight("Recovery work", null, null);

        assertThat(highlight.responsibilities()).isEmpty();
        assertThat(highlight.coverage()).isEmpty();
    }

    @Test
    void collectionsAreImmutableSnapshots() {
        var responsibilities = new ArrayList<>(List.of("Rotate secrets"));
        var source = new CareerHighlight.Source("NU.nl", "Incident reporting", "https://www.nu.nl/");
        var coverage = new ArrayList<>(List.of(source));
        var highlight = new CareerHighlight("Recovery work", responsibilities, coverage);

        responsibilities.clear();
        coverage.clear();

        assertThat(highlight.responsibilities()).containsExactly("Rotate secrets");
        assertThat(highlight.coverage()).containsExactly(source);
        assertThatThrownBy(() -> highlight.responsibilities().clear()).isInstanceOf(UnsupportedOperationException.class);
        assertThatThrownBy(() -> highlight.coverage().clear()).isInstanceOf(UnsupportedOperationException.class);
    }
}
