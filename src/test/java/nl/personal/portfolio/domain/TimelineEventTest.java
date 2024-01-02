package nl.personal.portfolio.domain;

import nl.jqno.equalsverifier.EqualsVerifier;
import org.junit.jupiter.api.Test;

import java.util.Optional;
import java.util.regex.Pattern;

import static nl.personal.portfolio.factory.TimelineEventTestFactory.defaultTimelineEvent;
import static org.assertj.core.api.Assertions.assertThat;

class TimelineEventTest {


    @Test
    void equalsAndHashCode() {
        EqualsVerifier.forClass(TimelineEvent.class).verify();
    }

    @Test
    void workPeriodIsCurrent() {
        final var currentPattern = Pattern.compile("^(0[1-9]|1[0-2])-(\\d{4}) → current$");
        final var currentEvent = defaultTimelineEvent().toBuilder().end(Optional.empty()).build();

        final var matcher = currentPattern.matcher(currentEvent.getWorkPeriod());

        assertThat(matcher).matches();
    }

    @Test
    void workPeriodIsNotCurrent() {
        final var nonCurrentPattern = Pattern.compile("^(0[1-9]|1[0-2])-(\\d{4}) → (0[1-9]|1[0-2])-(\\d{4})$");
        final var nonCurrentEvent = defaultTimelineEvent();

        final var matcher = nonCurrentPattern.matcher(nonCurrentEvent.getWorkPeriod());
        assertThat(matcher).matches();

    }

}
