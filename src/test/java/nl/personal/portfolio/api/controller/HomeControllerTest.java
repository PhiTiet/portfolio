package nl.personal.portfolio.api.controller;

import nl.personal.portfolio.api.advice.GlobalExceptionAdvice;
import nl.personal.portfolio.api.config.LocaleConfiguration;
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

import java.util.Locale;

import static nl.personal.portfolio.factory.HomePageDetailsTestFactory.defaultHomePageDetails;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(HomeController.class)
@Import({GlobalExceptionAdvice.class, LocaleConfiguration.class, SecurityConfiguration.class})
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

    @Test
    @DisplayName("should present Daily Talk Topics as a live Android app in English")
    void home_englishLocale_presentsDailyTalkTopicsAsLiveAndroidApp() throws Exception {
        Mockito.when(careerService.getDetails()).thenReturn(defaultHomePageDetails());

        mockMvc.perform(get(BASE_PATH).locale(Locale.ENGLISH))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("/webjars/alpinejs/3.15.12/dist/cdn.min-")))
                .andExpect(content().string(not(containsString("/webjars/alpinejs/3.15.8/"))))
                .andExpect(content().string(containsString("project-live-badge")))
                .andExpect(content().string(containsString(">Live</span>")))
                .andExpect(content().string(containsString("A live Android app")))
                .andExpect(content().string(not(containsString("Android/iOS"))));
    }

    @Test
    @DisplayName("should present Daily Talk Topics as a live Android app in Dutch")
    void home_dutchLocale_presentsDailyTalkTopicsAsLiveAndroidApp() throws Exception {
        Mockito.when(careerService.getDetails()).thenReturn(defaultHomePageDetails());

        mockMvc.perform(get(BASE_PATH).param("lang", "nl"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Een live Android-app")))
                .andExpect(content().string(not(containsString("iOS en Android"))));
    }

}
