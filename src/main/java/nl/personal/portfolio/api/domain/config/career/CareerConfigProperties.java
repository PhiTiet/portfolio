package nl.personal.portfolio.api.domain.config.career;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@EqualsAndHashCode
@Configuration
@ConfigurationProperties(prefix = "career")
public class CareerConfigProperties implements CareerProperties {
    @DateTimeFormat(pattern = "dd-MM-yyyy")
    private LocalDate birthday;
    @DateTimeFormat(pattern = "dd-MM-yyyy")
    private LocalDate professionalCareerStartDate;
    @DateTimeFormat(pattern = "dd-MM-yyyy")
    private LocalDate programmingStartDate;

    private List<Certificate> certificates;
}
