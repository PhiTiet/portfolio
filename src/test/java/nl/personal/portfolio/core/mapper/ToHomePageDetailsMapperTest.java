package nl.personal.portfolio.core.mapper;

import nl.personal.portfolio.domain.Recommendation;
import nl.personal.portfolio.domain.config.recommendation.RecommendationConfigProperties;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.LocalDate;
import java.time.Period;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static nl.personal.portfolio.factory.CareerPropertiesTestFactory.defaultCareerProperties;
import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("ToHomePageDetailsMapper")
class ToHomePageDetailsMapperTest {

    private static final LocalDate FIXED_DATE = LocalDate.of(2026, 2, 10);
    private static final Clock FIXED_CLOCK = Clock.fixed(
            FIXED_DATE.atStartOfDay(ZoneId.systemDefault()).toInstant(),
            ZoneId.systemDefault()
    );

    private final RecommendationConfigProperties recommendationConfigProperties = createRecommendationProperties();
    private final ToHomePageDetailsMapper sut = new ToHomePageDetailsMapper(FIXED_CLOCK, recommendationConfigProperties);

    @Test
    @DisplayName("should map career properties to home page details with correct calculations")
    void map_validProperties_returnsCorrectDetails() {
        final var properties = defaultCareerProperties();
        final var result = sut.map(properties);

        assertThat(result.certificates()).isEqualTo(properties.getCertificates());
        assertThat(result.hobbies()).isEqualTo(properties.getHobbies());
        assertThat(result.skills()).isEqualTo(properties.getSkills());
        assertThat(result.events()).isEqualTo(properties.getEvents());
        assertThat(result.recommendations()).isEqualTo(recommendationConfigProperties.getItems());
        assertThat(result.professionalProgrammerPeriod()).isEqualTo(Period.between(properties.getProfessionalCareerStartDate(), FIXED_DATE));
        assertThat(result.programmerPeriod()).isEqualTo(Period.between(properties.getProgrammingStartDate(), FIXED_DATE));
        assertThat(result.age()).isEqualTo(ChronoUnit.YEARS.between(properties.getBirthday(), FIXED_DATE));
    }

    private static RecommendationConfigProperties createRecommendationProperties() {
        var properties = new RecommendationConfigProperties();
        properties.setItems(List.of(new Recommendation("Great engineer", "John Doe", "JD", "Senior Engineer", "/pdf/test.pdf")));
        return properties;
    }

}
