package nl.personal.portfolio.domain;

import nl.jqno.equalsverifier.EqualsVerifier;
import org.junit.jupiter.api.Test;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static nl.personal.portfolio.factory.CertificateTestFactory.defaultCertificate;
import static org.assertj.core.api.Assertions.assertThat;

class CertificateTest {

    @Test
    void equals() {
        EqualsVerifier.forClass(Certificate.class).verify();
    }

    @Test
    void format() {
        Pattern validPattern = Pattern.compile("^(0[1-9]|1[0-2])-\\d{4}$");
        var certificate = defaultCertificate();
        Matcher matcher = validPattern.matcher(certificate.formattedAcquisitionDate());
        assertThat(matcher).matches();
    }

}