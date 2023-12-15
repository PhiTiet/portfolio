package nl.personal.portfolio.api.domain;

import lombok.Builder;

import java.time.Period;

@Builder
public record HomePageDetails(int age, Period professionalProgrammerPeriod, Period programmerPeriod) {
}
