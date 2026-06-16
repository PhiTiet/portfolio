package nl.personal.portfolio.factory;

import nl.personal.portfolio.domain.Certificate;

import java.time.LocalDate;

public final class CertificateTestFactory {

    public static final LocalDate DEFAULT_ACQUISITION_DATE = LocalDate.of(2024, 6, 1);

    private CertificateTestFactory() {
    }

    public static Certificate defaultCertificate() {
        return certificate("certificate", DEFAULT_ACQUISITION_DATE);
    }

    public static Certificate certificate(final String title, final LocalDate acquisitionDate) {
        return new Certificate(title, "institution", acquisitionDate, null);
    }
}
