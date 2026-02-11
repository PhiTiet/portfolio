package nl.personal.portfolio.factory;

import nl.personal.portfolio.domain.config.career.CareerConfigProperties;
import nl.personal.portfolio.domain.config.career.CareerProperties;

import java.time.LocalDate;
import java.util.Collections;

import static nl.personal.portfolio.factory.CertificateTestFactory.defaultCertificate;
import static nl.personal.portfolio.factory.HobbyTestFactory.defaultHobby;
import static nl.personal.portfolio.factory.SkillTestFactory.defaultSkill;
import static nl.personal.portfolio.factory.TimelineEventTestFactory.defaultTimelineEvent;

public final class CareerPropertiesTestFactory {

    private CareerPropertiesTestFactory() {
    }

    public static CareerProperties defaultCareerProperties() {
        final var properties = new CareerConfigProperties();
        properties.setBirthday(LocalDate.of(1999, 12, 9));
        properties.setProfessionalCareerStartDate(LocalDate.of(1980, 2, 2));
        properties.setProgrammingStartDate(LocalDate.of(2012, 12, 12));
        properties.setCertificates(Collections.nCopies(5, defaultCertificate()));
        properties.setSkills(Collections.nCopies(5, defaultSkill()));
        properties.setEvents(Collections.nCopies(5, defaultTimelineEvent()));
        properties.setHobbies(Collections.nCopies(5, defaultHobby()));
        return properties;
    }
}
