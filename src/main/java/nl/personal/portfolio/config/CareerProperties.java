package nl.personal.portfolio.config;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import nl.personal.portfolio.domain.CareerHighlight;
import nl.personal.portfolio.domain.Certificate;
import nl.personal.portfolio.domain.Contribution;
import nl.personal.portfolio.domain.Hobby;
import nl.personal.portfolio.domain.Icon;
import nl.personal.portfolio.domain.LocalizedText;
import nl.personal.portfolio.domain.Skill;
import nl.personal.portfolio.domain.TimelineEvent;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.validation.annotation.Validated;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;

import static nl.personal.portfolio.domain.DatePatterns.INPUT_FORMAT;

@Validated
@ConfigurationProperties("career")
public record CareerProperties(
        @NotNull @DateTimeFormat(pattern = INPUT_FORMAT) LocalDate birthday,
        @NotNull @DateTimeFormat(pattern = INPUT_FORMAT) LocalDate programmingStartDate,
        @NotNull @DateTimeFormat(pattern = INPUT_FORMAT) LocalDate professionalCareerStartDate,
        @NotEmpty List<@Valid CertificateEntry> certificates,
        @NotEmpty List<@Valid HobbyEntry> hobbies,
        @NotEmpty List<@Valid Skill> skills,
        @NotEmpty List<@Valid EventEntry> events,
        @NotNull List<@Valid ContributionEntry> contributions) {

    public record CertificateEntry(
            @NotNull LocalizedText title,
            @NotBlank String institution,
            @NotNull @DateTimeFormat(pattern = INPUT_FORMAT) LocalDate acquisitionDate,
            String thesisUrl) {

        Certificate in(Locale locale) {
            return new Certificate(title.in(locale), institution, acquisitionDate, thesisUrl);
        }
    }

    public record HobbyEntry(@NotNull LocalizedText name, @NotNull @Valid Icon icon) {

        Hobby in(Locale locale) {
            return new Hobby(name.in(locale), icon);
        }
    }

    public record EventEntry(
            @NotBlank String employer,
            @NotNull LocalizedText jobTitle,
            @NotNull LocalizedText description,
            @NotNull @DateTimeFormat(pattern = INPUT_FORMAT) LocalDate start,
            @DateTimeFormat(pattern = INPUT_FORMAT) LocalDate end,
            @Valid HighlightEntry highlight) {

        TimelineEvent in(Locale locale) {
            return new TimelineEvent(employer, jobTitle.in(locale), description.in(locale), start, end,
                    highlight == null ? null : highlight.in(locale));
        }
    }

    public record HighlightEntry(
            @NotNull LocalizedText summary,
            List<LocalizedText> responsibilities,
            List<@Valid SourceEntry> coverage) {

        CareerHighlight in(Locale locale) {
            return new CareerHighlight(summary.in(locale),
                    responsibilities == null ? null : responsibilities.stream().map(text -> text.in(locale)).toList(),
                    coverage == null ? null : coverage.stream().map(source -> source.in(locale)).toList());
        }
    }

    public record SourceEntry(@NotBlank String publisher, @NotNull LocalizedText title, @NotBlank String url) {

        CareerHighlight.Source in(Locale locale) {
            return new CareerHighlight.Source(publisher, title.in(locale), url);
        }
    }

    public record ContributionEntry(
            @NotBlank String repository,
            @NotNull LocalizedText title,
            @NotBlank String url,
            @NotNull @DateTimeFormat(pattern = INPUT_FORMAT) LocalDate merged) {

        Contribution in(Locale locale) {
            return new Contribution(repository, title.in(locale), url, merged);
        }
    }

    public List<Certificate> certificates(Locale locale) {
        return certificates.stream().map(entry -> entry.in(locale)).toList();
    }

    public List<Hobby> hobbies(Locale locale) {
        return hobbies.stream().map(entry -> entry.in(locale)).toList();
    }

    public List<TimelineEvent> events(Locale locale) {
        return events.stream().map(entry -> entry.in(locale)).toList();
    }

    public List<Contribution> contributions(Locale locale) {
        return contributions.stream().map(entry -> entry.in(locale)).toList();
    }
}
