package nl.personal.portfolio.core;

import nl.personal.portfolio.core.mapper.ToHomePageDetailsMapper;
import nl.personal.portfolio.domain.config.career.CareerProperties;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.i18n.LocaleContextHolder;

import java.util.Locale;

import static nl.personal.portfolio.factory.HomePageDetailsTestFactory.defaultHomePageDetails;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("CareerService")
class CareerServiceTest {

    @Mock
    private CareerProperties englishCareerProperties;

    @Mock
    private CareerProperties dutchCareerProperties;

    @Mock
    private ToHomePageDetailsMapper toHomePageDetailsMapper;

    @Test
    @DisplayName("should delegate to mapper with English career properties for English locale")
    void getDetails_englishLocale_delegatesToMapperWithEnglishProperties() {
        LocaleContextHolder.setLocale(Locale.ENGLISH);
        var sut = new CareerService(englishCareerProperties, dutchCareerProperties, toHomePageDetailsMapper);
        when(toHomePageDetailsMapper.map(englishCareerProperties)).thenReturn(defaultHomePageDetails());

        sut.getDetails();

        verify(toHomePageDetailsMapper).map(englishCareerProperties);
    }

    @Test
    @DisplayName("should delegate to mapper with Dutch career properties for Dutch locale")
    void getDetails_dutchLocale_delegatesToMapperWithDutchProperties() {
        LocaleContextHolder.setLocale(Locale.of("nl"));
        var sut = new CareerService(englishCareerProperties, dutchCareerProperties, toHomePageDetailsMapper);
        when(toHomePageDetailsMapper.map(dutchCareerProperties)).thenReturn(defaultHomePageDetails());

        sut.getDetails();

        verify(toHomePageDetailsMapper).map(dutchCareerProperties);
    }

    @Test
    @DisplayName("should fall back to English for unsupported locale")
    void getDetails_unsupportedLocale_fallsBackToEnglish() {
        LocaleContextHolder.setLocale(Locale.FRENCH);
        var sut = new CareerService(englishCareerProperties, dutchCareerProperties, toHomePageDetailsMapper);
        when(toHomePageDetailsMapper.map(englishCareerProperties)).thenReturn(defaultHomePageDetails());

        sut.getDetails();

        verify(toHomePageDetailsMapper).map(englishCareerProperties);
    }
}
