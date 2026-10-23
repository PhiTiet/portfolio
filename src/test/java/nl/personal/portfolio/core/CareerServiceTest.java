package nl.personal.portfolio.core;

import nl.personal.portfolio.domain.Certificate;
import nl.personal.portfolio.domain.Hobby;
import nl.personal.portfolio.domain.Recommendation;
import nl.personal.portfolio.domain.Skill;
import nl.personal.portfolio.domain.TimelineEvent;
import nl.personal.portfolio.domain.config.career.CareerConfigProperties;
import nl.personal.portfolio.domain.config.recommendation.RecommendationConfigProperties;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.boot.SpringBootVersion;
import org.springframework.context.i18n.LocaleContextHolder;

import java.time.Clock;
import java.time.LocalDate;
import java.time.Period;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Locale;

import static org.assertj.core.api.Assertions.assertThat;

class CareerServiceTest {

    @AfterEach
    void resetLocale() {
        LocaleContextHolder.resetLocaleContext();
    }

    @ParameterizedTest
    @CsvSource({"en,English", "nl,Nederlands", "fr,English"})
    void buildsLocalizedDetailsWithSortedContentAndCalculatedDates(String language, String expectedHobby) {
        var english = career("English");
        var dutch = career("Nederlands");
        var recommendations = new RecommendationConfigProperties();
        recommendations.setItems(List.of(new Recommendation("Great work", "Great work", "Jane", "J", "Engineer", "/letter.pdf", LocalDate.of(2024, 1, 1))));
        var clock = Clock.fixed(LocalDate.of(2026, 2, 10).atStartOfDay(ZoneOffset.UTC).toInstant(), ZoneOffset.UTC);
        var service = new CareerService(english, dutch, clock, recommendations);
        LocaleContextHolder.setLocale(Locale.forLanguageTag(language));

        var details = service.getDetails();

        assertThat(details.hobbies()).extracting(Hobby::name).containsExactly(expectedHobby);
        assertThat(details.certificates()).extracting(Certificate::title).containsExactly("New", "Old");
        assertThat(details.skills()).extracting(Skill::name).containsExactly("Advanced", "Beginner");
        assertThat(details.events()).extracting(TimelineEvent::employer).containsExactly("Recent", "Previous");
        assertThat(details.recommendations()).isEqualTo(recommendations.getItems());
        assertThat(details.age()).isEqualTo(26);
        assertThat(details.professionalProgrammerPeriod()).isEqualTo(Period.of(5, 1, 9));
        assertThat(details.programmerPeriod()).isEqualTo(Period.of(13, 1, 29));
        assertThat(details.springBootVersion()).isEqualTo(SpringBootVersion.getVersion());
        assertThat(details.javaVersion()).isEqualTo(System.getProperty("java.version"));
    }

    private CareerConfigProperties career(String hobby) {
        var properties = new CareerConfigProperties();
        properties.setBirthday(LocalDate.of(1999, 12, 9));
        properties.setProfessionalCareerStartDate(LocalDate.of(2021, 1, 1));
        properties.setProgrammingStartDate(LocalDate.of(2012, 12, 12));
        properties.setCertificates(List.of(
                new Certificate("Old", "Institute", LocalDate.of(2020, 1, 1), null),
                new Certificate("New", "Institute", LocalDate.of(2024, 1, 1), null)));
        properties.setSkills(List.of(new Skill("Beginner", 2, null), new Skill("Advanced", 9, null)));
        properties.setEvents(List.of(
                new TimelineEvent("Previous", "Engineer", "", null, LocalDate.of(2020, 1, 1), LocalDate.of(2023, 1, 1), null),
                new TimelineEvent("Recent", "Engineer", "", null, LocalDate.of(2024, 1, 1), null, null)));
        properties.setHobbies(List.of(new Hobby(hobby, null)));
        return properties;
    }
}
