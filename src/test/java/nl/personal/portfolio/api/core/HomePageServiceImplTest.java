package nl.personal.portfolio.api.core;

import nl.personal.portfolio.api.core.mapper.ToHomePageDetailsMapper;
import nl.personal.portfolio.api.domain.config.career.CareerProperties;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import static nl.personal.portfolio.api.factory.HomePageDetailsTestFactory.homePageDetails;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@SpringBootTest
class HomePageServiceImplTest {

    @Autowired
    private HomePageServiceImpl sut;

    @MockBean
    private ToHomePageDetailsMapper toHomePageDetailsMapper;

    @Test
    void getDetails(){
        when(toHomePageDetailsMapper.map(any(CareerProperties.class))).thenReturn(homePageDetails());
        sut.getDetails();
        verify(toHomePageDetailsMapper).map(any(CareerProperties.class));
    }

}