package nl.personal.portfolio.factory;

import nl.personal.portfolio.domain.Certificate;

import java.time.LocalDate;

public final class CertificateTestFactory {

    private CertificateTestFactory() {
    }

    public static Certificate defaultCertificate() {
        return new Certificate("certificate", "institution", LocalDate.now());
    }
}
