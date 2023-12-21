package nl.personal.portfolio.api.domain.config.career;

import nl.personal.portfolio.api.domain.Certificate;
import nl.personal.portfolio.api.domain.Skill;
import nl.personal.portfolio.api.domain.TimelineEvent;

import java.time.LocalDate;
import java.util.List;

public interface CareerProperties {
    List<Certificate> getCertificates();

    LocalDate getBirthday();

    LocalDate getProfessionalCareerStartDate();

    LocalDate getProgrammingStartDate();

    List<Skill> getSkills();

    List<TimelineEvent> getEvents();

}
