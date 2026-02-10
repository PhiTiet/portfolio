package nl.personal.portfolio.core;

import nl.personal.portfolio.core.mapper.ToHomePageDetailsMapper;
import nl.personal.portfolio.domain.config.career.CareerProperties;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static nl.personal.portfolio.factory.HomePageDetailsTestFactory.defaultHomePageDetails;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("CareerService")
class CareerServiceTest {

    @Mock
    private CareerProperties careerProperties;

    @Mock
    private ToHomePageDetailsMapper toHomePageDetailsMapper;

    @InjectMocks
    private CareerService sut;

    @Test
    @DisplayName("should delegate to mapper with career properties")
    void getDetails_delegatesToMapper() {
        when(toHomePageDetailsMapper.map(careerProperties)).thenReturn(defaultHomePageDetails());
        sut.getDetails();
        verify(toHomePageDetailsMapper).map(careerProperties);
    }

}
