package nl.personal.portfolio.api.domain.config.career;

import java.time.LocalDate;
import java.util.List;

public interface CareerProperties {
    List<Certificate> getCertificates();

    LocalDate getBirthday();

    LocalDate getProfessionalCareerStartDate();

    LocalDate getProgrammingStartDate();

}
