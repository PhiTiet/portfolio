package nl.personal.portfolio.api.domain;

import lombok.Builder;

import java.time.Period;
import java.util.List;

@Builder
public record HomePageDetails(
      int age,
      Period professionalProgrammerPeriod,
      Period programmerPeriod,
      List<Certificate> certificates,
      List<Skill> skills) {
}
