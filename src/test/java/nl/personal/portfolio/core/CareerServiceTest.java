package nl.personal.portfolio.core;

import nl.personal.portfolio.config.CareerProperties;
import nl.personal.portfolio.config.CareerProperties.CertificateEntry;
import nl.personal.portfolio.config.CareerProperties.ContributionEntry;
import nl.personal.portfolio.config.CareerProperties.EventEntry;
import nl.personal.portfolio.config.CareerProperties.HobbyEntry;
import nl.personal.portfolio.config.RecommendationProperties;
import nl.personal.portfolio.domain.Certificate;
import nl.personal.portfolio.domain.Contribution;
import nl.personal.portfolio.domain.Hobby;
import nl.personal.portfolio.domain.LocalizedText;
import nl.personal.portfolio.domain.Recommendation;
import nl.personal.portfolio.domain.Skill;
import nl.personal.portfolio.domain.TimelineEvent;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.time.Clock;
import java.time.LocalDate;
import java.time.Period;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Locale;

import static org.assertj.core.api.Assertions.assertThat;

class CareerServiceTest {

    private static final LocalizedText HOBBY = new LocalizedText("Cooking", "Koken");

    @ParameterizedTest
    @CsvSource({"en,Cooking", "nl,Koken", "fr,Cooking"})
    void buildsLocalizedDetailsWithSortedContentAndCalculatedDates(String language, String expectedHobby) {
        var recommendations = new RecommendationProperties(List.of(
                new Recommendation("Great work", "Great work", "Jane", "J", "Engineer", "/letter.pdf", LocalDate.of(2024, 1, 1))));
        var clock = Clock.fixed(LocalDate.of(2026, 2, 10).atStartOfDay(ZoneOffset.UTC).toInstant(), ZoneOffset.UTC);
        var service = new CareerService(career(), recommendations, clock);

        var details = service.getDetails(Locale.forLanguageTag(language));

        assertThat(details.hobbies()).extracting(Hobby::name).containsExactly(expectedHobby);
        assertThat(details.certificates()).extracting(Certificate::title).containsExactly("New", "Old");
        assertThat(details.skills()).extracting(Skill::name).containsExactly("Advanced", "Beginner");
        assertThat(details.events()).extracting(TimelineEvent::employer).containsExactly("Recent", "Previous");
        assertThat(details.contributions()).extracting(Contribution::title).containsExactly("Newer fix", "Older fix");
        assertThat(details.recommendations()).isEqualTo(recommendations.items());
        assertThat(details.professionalProgrammerPeriod()).isEqualTo(Period.of(5, 1, 9));
    }

    private static CareerProperties career() {
        var text = LocalizedText.of("");
        return new CareerProperties(
                LocalDate.of(2021, 1, 1),
                List.of(
                        new CertificateEntry(LocalizedText.of("Old"), "Institute", LocalDate.of(2020, 1, 1), null),
                        new CertificateEntry(LocalizedText.of("New"), "Institute", LocalDate.of(2024, 1, 1), null)),
                List.of(new HobbyEntry(HOBBY, null)),
                List.of(new Skill("Beginner", 2, null), new Skill("Advanced", 9, null)),
                List.of(
                        new EventEntry("Previous", text, text, LocalDate.of(2020, 1, 1), LocalDate.of(2023, 1, 1), null),
                        new EventEntry("Recent", text, text, LocalDate.of(2024, 1, 1), null, null)),
                List.of(
                        new ContributionEntry("repo", LocalizedText.of("Older fix"), "https://example.com/1", LocalDate.of(2025, 1, 1)),
                        new ContributionEntry("repo", LocalizedText.of("Newer fix"), "https://example.com/2", LocalDate.of(2026, 1, 1))));
    }
}
