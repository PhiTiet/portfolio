package nl.personal.portfolio.core;

import nl.personal.portfolio.core.mapper.ToHomePageDetailsMapper;
import nl.personal.portfolio.domain.config.career.CareerProperties;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import static nl.personal.portfolio.factory.HomePageDetailsTestFactory.defaultHomePageDetails;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@SpringBootTest
class CareerServiceImplTest {

    @Autowired
    private CareerServiceImpl sut;

    @MockitoBean
    private ToHomePageDetailsMapper toHomePageDetailsMapper;

    @Test
    void getDetails() {
        when(toHomePageDetailsMapper.map(any(CareerProperties.class))).thenReturn(defaultHomePageDetails());
        sut.getDetails();
        verify(toHomePageDetailsMapper).map(any(CareerProperties.class));
    }

}
