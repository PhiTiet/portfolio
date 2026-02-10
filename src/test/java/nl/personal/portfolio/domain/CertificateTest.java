package nl.personal.portfolio.domain;

import nl.jqno.equalsverifier.EqualsVerifier;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.regex.Pattern;

import static nl.personal.portfolio.factory.CertificateTestFactory.defaultCertificate;
import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Certificate")
class CertificateTest {

    @Test
    @DisplayName("should satisfy equals and hashCode contract")
    void equalsAndHashCode() {
        EqualsVerifier.forClass(Certificate.class).verify();
    }

    @Test
    @DisplayName("should format acquisition date as MM-yyyy")
    void formattedAcquisitionDate_returnsMonthYearFormat() {
        final var validPattern = Pattern.compile("^(0[1-9]|1[0-2])-\\d{4}$");
        final var certificate = defaultCertificate();
        final var matcher = validPattern.matcher(certificate.formattedAcquisitionDate());
        assertThat(matcher).matches();
    }

}
