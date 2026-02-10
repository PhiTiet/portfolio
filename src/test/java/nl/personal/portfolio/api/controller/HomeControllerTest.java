package nl.personal.portfolio.api.controller;

import nl.personal.portfolio.api.advice.RestControllerExceptionAdvice;
import nl.personal.portfolio.api.security.SecurityConfiguration;
import nl.personal.portfolio.core.CareerService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static nl.personal.portfolio.factory.HomePageDetailsTestFactory.defaultHomePageDetails;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(HomeController.class)
@Import({RestControllerExceptionAdvice.class, SecurityConfiguration.class})
@DisplayName("HomeController")
class HomeControllerTest {

    private static final String BASE_PATH = "/";

    @MockitoBean
    private CareerService careerService;

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("should return 200 OK with home page details")
    void home_validRequest_returnsOk() throws Exception {
        Mockito.when(careerService.getDetails()).thenReturn(defaultHomePageDetails());
        mockMvc.perform(get(BASE_PATH)).andExpect(status().isOk());
        Mockito.verify(careerService).getDetails();
    }

}
