package nl.personal.portfolio.factory;

import nl.personal.portfolio.api.domain.config.career.CareerConfigProperties;
import nl.personal.portfolio.api.domain.config.career.CareerProperties;

import java.time.LocalDate;
import java.util.Collections;

import static nl.personal.portfolio.factory.CertificateTestFactory.certificate;

public class CareerPropertiesTestFactory {
    public static CareerProperties careerProperties() {
        var properties = new CareerConfigProperties();
        properties.setBirthday(LocalDate.of(1999, 12, 9));
        properties.setProfessionalCareerStartDate(LocalDate.of(1980, 2, 2));
        properties.setProgrammingStartDate(LocalDate.of(2012, 12, 12));
        properties.setCertificates(Collections.nCopies(5, certificate()));
        return properties;
    }
}