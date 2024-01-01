package nl.personal.portfolio.domain;

import nl.jqno.equalsverifier.EqualsVerifier;
import org.junit.jupiter.api.Test;

import java.util.Optional;
import java.util.regex.Pattern;

import static nl.personal.portfolio.factory.TimelineEventTestFactory.defaultTimelineEvent;
import static org.assertj.core.api.Assertions.assertThat;

class TimelineEventTest {


    @Test
    void equals() {
        EqualsVerifier.forClass(TimelineEvent.class).verify();
    }

    @Test
    void workPeriodIsCurrent() {
        var currentPattern = Pattern.compile("^(0[1-9]|1[0-2])-(\\d{4}) → current$");
        var currentEvent = defaultTimelineEvent().toBuilder().end(Optional.empty()).build();

        var matcher = currentPattern.matcher(currentEvent.getWorkPeriod());

        assertThat(matcher).matches();
    }

    @Test
    void workPeriodIsNotCurrent() {
        var nonCurrentPattern = Pattern.compile("^(0[1-9]|1[0-2])-(\\d{4}) → (0[1-9]|1[0-2])-(\\d{4})$");
        var nonCurrentEvent = defaultTimelineEvent();

        var matcher = nonCurrentPattern.matcher(nonCurrentEvent.getWorkPeriod());
        assertThat(matcher).matches();

    }

}