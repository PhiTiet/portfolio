package nl.personal.portfolio.domain;

import nl.jqno.equalsverifier.EqualsVerifier;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.regex.Pattern;

import static nl.personal.portfolio.factory.TimelineEventTestFactory.defaultTimelineEvent;
import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("TimelineEvent")
class TimelineEventTest {

    @Test
    @DisplayName("should satisfy equals and hashCode contract")
    void equalsAndHashCode() {
        EqualsVerifier.forClass(TimelineEvent.class).verify();
    }

    @Test
    @DisplayName("should format work period as 'current' when end date is null")
    void workPeriod_nullEnd_showsCurrent() {
        final var currentPattern = Pattern.compile("^(0[1-9]|1[0-2])-(\\d{4}) \u2192 current$");
        final var currentEvent = defaultTimelineEvent().toBuilder().end(null).build();

        final var matcher = currentPattern.matcher(currentEvent.workPeriod());

        assertThat(matcher).matches();
    }

    @Test
    @DisplayName("should format work period with both dates when end date exists")
    void workPeriod_withEnd_showsBothDates() {
        final var nonCurrentPattern = Pattern.compile("^(0[1-9]|1[0-2])-(\\d{4}) \u2192 (0[1-9]|1[0-2])-(\\d{4})$");
        final var nonCurrentEvent = defaultTimelineEvent();

        final var matcher = nonCurrentPattern.matcher(nonCurrentEvent.workPeriod());
        assertThat(matcher).matches();
    }

}
