package nl.personal.portfolio.api.factory;

import nl.personal.portfolio.api.domain.Certificate;

import java.time.LocalDate;

public class CertificateTestFactory {
    public static Certificate certificate() {
        return new Certificate("certificate", "institution", LocalDate.now());
    }
}
