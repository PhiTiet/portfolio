package nl.personal.portfolio.domain.config.career;

import lombok.Data;
import nl.personal.portfolio.domain.Certificate;
import nl.personal.portfolio.domain.Hobby;
import nl.personal.portfolio.domain.Skill;
import nl.personal.portfolio.domain.TimelineEvent;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.util.List;

import static nl.personal.portfolio.domain.DatePatterns.INPUT_FORMAT;

@Data
@ConfigurationProperties(prefix = "career")
public class CareerConfigProperties implements CareerProperties {

    @DateTimeFormat(pattern = INPUT_FORMAT)
    private LocalDate birthday;

    @DateTimeFormat(pattern = INPUT_FORMAT)
    private LocalDate professionalCareerStartDate;

    @DateTimeFormat(pattern = INPUT_FORMAT)
    private LocalDate programmingStartDate;

    private List<Certificate> certificates;

    private List<Skill> skills;

    private List<TimelineEvent> events;

    private List<Hobby> hobbies;
}
