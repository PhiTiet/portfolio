package nl.personal.portfolio.factory;

import nl.personal.portfolio.api.domain.Certificate;

import java.time.LocalDate;

public class CertificateTestFactory {
    public static Certificate defaultCertificate() {
        return new Certificate("certificate", "institution", LocalDate.now());
    }
}
