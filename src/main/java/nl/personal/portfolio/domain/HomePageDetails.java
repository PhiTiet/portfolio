package nl.personal.portfolio.domain;

import java.time.Period;
import java.util.List;

public record HomePageDetails(
        Period professionalProgrammerPeriod,
        List<Certificate> certificates,
        List<Hobby> hobbies,
        List<Skill> skills,
        List<TimelineEvent> events,
        List<Contribution> contributions,
        List<Recommendation> recommendations,
        String springBootVersion,
        String javaVersion) {
}
