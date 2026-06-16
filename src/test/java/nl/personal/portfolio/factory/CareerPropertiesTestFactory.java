package nl.personal.portfolio.factory;

import nl.personal.portfolio.domain.config.career.CareerConfigProperties;
import nl.personal.portfolio.domain.config.career.CareerProperties;

import java.time.LocalDate;
import java.util.List;

import static nl.personal.portfolio.factory.CertificateTestFactory.certificate;
import static nl.personal.portfolio.factory.HobbyTestFactory.defaultHobby;
import static nl.personal.portfolio.factory.SkillTestFactory.skill;
import static nl.personal.portfolio.factory.TimelineEventTestFactory.timelineEvent;

public final class CareerPropertiesTestFactory {

    private CareerPropertiesTestFactory() {
    }

    public static CareerProperties defaultCareerProperties() {
        final var properties = new CareerConfigProperties();
        properties.setBirthday(LocalDate.of(1999, 12, 9));
        properties.setProfessionalCareerStartDate(LocalDate.of(1980, 2, 2));
        properties.setProgrammingStartDate(LocalDate.of(2012, 12, 12));
        properties.setCertificates(List.of(
                certificate("old", LocalDate.of(2020, 1, 1)),
                certificate("new", LocalDate.of(2024, 1, 1)),
                certificate("middle", LocalDate.of(2022, 1, 1))
        ));
        properties.setSkills(List.of(
                skill("low", 4),
                skill("high", 9),
                skill("middle", 7)
        ));
        properties.setEvents(List.of(
                timelineEvent("old", LocalDate.of(2020, 1, 1)),
                timelineEvent("new", LocalDate.of(2024, 1, 1)),
                timelineEvent("middle", LocalDate.of(2022, 1, 1))
        ));
        properties.setHobbies(List.of(defaultHobby(), defaultHobby(), defaultHobby()));
        return properties;
    }
}
