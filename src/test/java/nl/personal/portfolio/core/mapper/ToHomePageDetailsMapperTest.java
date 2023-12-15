package nl.personal.portfolio.core.mapper;

import nl.personal.portfolio.api.core.mapper.ToHomePageDetailsMapper;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.Period;
import java.time.temporal.ChronoUnit;

import static nl.personal.portfolio.factory.CareerPropertiesTestFactory.careerProperties;
import static org.assertj.core.api.Assertions.assertThat;

class ToHomePageDetailsMapperTest {
    private final ToHomePageDetailsMapper sut = new ToHomePageDetailsMapper();

    @Test
    void map() {
        var properties = careerProperties();
        var result = sut.map(properties);
        assertThat(result.certificates()).isEqualTo(properties.getCertificates());
        assertThat(result.professionalProgrammerPeriod()).isEqualTo(Period.between(properties.getProfessionalCareerStartDate(), LocalDate.now()));
        assertThat(result.programmerPeriod()).isEqualTo(Period.between(properties.getProgrammingStartDate(), LocalDate.now()));
        assertThat(result.age()).isEqualTo(ChronoUnit.YEARS.between(properties.getBirthday(), LocalDate.now()));
    }

}