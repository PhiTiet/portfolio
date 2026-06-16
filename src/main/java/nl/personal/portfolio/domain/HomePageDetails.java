package nl.personal.portfolio.domain;

import java.time.Period;
import java.util.List;

public record HomePageDetails(
        int age,
        Period professionalProgrammerPeriod,
        Period programmerPeriod,
        List<Certificate> certificates,
        List<Hobby> hobbies,
        List<Skill> skills,
        List<TimelineEvent> events,
        List<Recommendation> recommendations,
        String springBootVersion,
        String javaVersion) {
}
