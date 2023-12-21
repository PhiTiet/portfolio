package nl.personal.portfolio.api.domain.config.career;

import lombok.Data;
import nl.personal.portfolio.api.domain.Certificate;
import nl.personal.portfolio.api.domain.Skill;
import nl.personal.portfolio.api.domain.TimelineEvent;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.util.List;

@Data
@Configuration
@ConfigurationProperties(prefix = "career")
public class CareerConfigProperties implements CareerProperties {

    private LocalDate birthday;

    private LocalDate professionalCareerStartDate;

    private LocalDate programmingStartDate;

    private List<Certificate> certificates;

    private List<Skill> skills;

    private List<TimelineEvent> events;
}
