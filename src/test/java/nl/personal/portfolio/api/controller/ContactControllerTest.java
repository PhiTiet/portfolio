package nl.personal.portfolio.api.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("ContactController")
class ContactControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("should accept valid contact form submission")
    void submitContactForm_validRequest_returnsSuccess() throws Exception {
        String requestBody = """
            {
                "name": "John Doe",
                "email": "john@example.com",
                "message": "Hello, this is a test message with sufficient length."
            }
            """;

        mockMvc.perform(post("/api/contact")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("success"));
    }

    @Test
    @DisplayName("should reject request with blank name")
    void submitContactForm_blankName_returnsBadRequest() throws Exception {
        String requestBody = """
            {
                "name": "",
                "email": "john@example.com",
                "message": "Hello, this is a test message with sufficient length."
            }
            """;

        mockMvc.perform(post("/api/contact")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.errors.name").exists());
    }

    @Test
    @DisplayName("should reject request with invalid email")
    void submitContactForm_invalidEmail_returnsBadRequest() throws Exception {
        String requestBody = """
            {
                "name": "John Doe",
                "email": "not-an-email",
                "message": "Hello, this is a test message with sufficient length."
            }
            """;

        mockMvc.perform(post("/api/contact")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.errors.email").exists());
    }

    @Test
    @DisplayName("should reject request with short message")
    void submitContactForm_shortMessage_returnsBadRequest() throws Exception {
        String requestBody = """
            {
                "name": "John Doe",
                "email": "john@example.com",
                "message": "Hi"
            }
            """;

        mockMvc.perform(post("/api/contact")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.errors.message").exists());
    }

    @Test
    @DisplayName("should reject request with missing fields")
    void submitContactForm_missingFields_returnsBadRequest() throws Exception {
        String requestBody = "{}";

        mockMvc.perform(post("/api/contact")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.errors").exists());
    }
}
