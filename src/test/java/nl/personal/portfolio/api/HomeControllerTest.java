package nl.personal.portfolio.api;

import nl.personal.portfolio.api.advice.RestControllerExceptionAdvice;
import nl.personal.portfolio.api.security.SecurityConfiguration;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest
@Import({RestControllerExceptionAdvice.class, HomeController.class, SecurityConfiguration.class})
class HomeControllerTest {

    private static final String HOME_PATH = "/home";
    private static final String BASE_PATH = "/";

    @Autowired
    private MockMvc mockMvc;

    @Test
    void getOk() throws Exception {
        mockMvc.perform(get(HOME_PATH)).andExpect(status().isOk());
    }

    @Test
    void basePathRedirectsToHome() throws Exception {
        mockMvc.perform(get(BASE_PATH))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/home"))
                .andReturn();
    }
}