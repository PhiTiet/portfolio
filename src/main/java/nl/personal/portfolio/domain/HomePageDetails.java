package nl.personal.portfolio.domain;

import lombok.Builder;
import org.springframework.boot.SpringBootVersion;

import java.time.Period;
import java.util.List;

@Builder
public record HomePageDetails(
        int age,
        Period professionalProgrammerPeriod,
        Period programmerPeriod,
        List<Certificate> certificates,
        List<Hobby> hobbies,
        List<Skill> skills,
        List<TimelineEvent> events) {

    public String currentSpringBootVersion() {
        return SpringBootVersion.getVersion();
    }

    public String currentJavaVersion() {
        return System.getProperty("java.version");
    }
}
