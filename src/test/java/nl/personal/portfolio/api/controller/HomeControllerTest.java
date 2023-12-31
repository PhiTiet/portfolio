package nl.personal.portfolio.api.controller;

import nl.personal.portfolio.api.advice.RestControllerExceptionAdvice;
import nl.personal.portfolio.api.security.SecurityConfiguration;
import nl.personal.portfolio.core.HomePageService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import static nl.personal.portfolio.factory.HomePageDetailsTestFactory.defaultHomePageDetails;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(HomeController.class)
@Import({RestControllerExceptionAdvice.class, SecurityConfiguration.class})
class HomeControllerTest {

    private static final String BASE_PATH = "/";

    @MockBean
    private HomePageService homePageService;

    @Autowired
    private MockMvc mockMvc;

    @Test
    void getOk() throws Exception {
        Mockito.when(homePageService.getDetails()).thenReturn(defaultHomePageDetails());
        mockMvc.perform(get(BASE_PATH)).andExpect(status().isOk());
        Mockito.verify(homePageService).getDetails();
    }

}
