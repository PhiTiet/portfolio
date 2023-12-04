package nl.personal.portfolio.api;

import nl.personal.portfolio.api.advice.RestControllerExceptionAdvice;
import nl.personal.portfolio.api.security.SecurityConfiguration;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest
@Import({RestControllerExceptionAdvice.class, HelloController.class, SecurityConfiguration.class})
class HelloControllerTest {

    private static final String BASE_PATH = "/hello";

    @Autowired
    private MockMvc mockMvc;

    @Test
    void getOk() throws Exception {
        mockMvc.perform(get(BASE_PATH)).andExpect(status().isOk());
    }


}