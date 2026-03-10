package nl.personal.portfolio.api.controller;

import nl.personal.portfolio.core.ContactDeliveryException;
import nl.personal.portfolio.core.ContactService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("ContactController")
class ContactControllerTest {

    private static final String BASE_PATH = "/api/contact";
    private static final String VALID_REQUEST = """
            {
                "name": "John Doe",
                "email": "john@example.com",
                "message": "Hello, this is a test message with sufficient length."
            }
            """;

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ContactService contactService;

    @Test
    @DisplayName("should accept valid contact form submission")
    void submitContactForm_validRequest_returnsSuccess() throws Exception {
        performContactRequest(VALID_REQUEST, "198.51.100.10", true)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("success"));

        verify(contactService).processContactForm(any());
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

        performContactRequest(requestBody, "198.51.100.11", true)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.errors.name").exists());

        verifyNoInteractions(contactService);
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

        performContactRequest(requestBody, "198.51.100.12", true)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.errors.email").exists());

        verifyNoInteractions(contactService);
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

        performContactRequest(requestBody, "198.51.100.13", true)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.errors.message").exists());

        verifyNoInteractions(contactService);
    }

    @Test
    @DisplayName("should reject request with missing fields")
    void submitContactForm_missingFields_returnsBadRequest() throws Exception {
        String requestBody = "{}";

        performContactRequest(requestBody, "198.51.100.14", true)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.errors").exists());

        verifyNoInteractions(contactService);
    }

    @Test
    @DisplayName("should reject request without csrf token")
    void submitContactForm_missingCsrf_returnsForbidden() throws Exception {
        performContactRequest(VALID_REQUEST, "198.51.100.15", false)
                .andExpect(status().isForbidden());

        verifyNoInteractions(contactService);
    }

    @Test
    @DisplayName("should return service unavailable when contact delivery fails")
    void submitContactForm_deliveryFailure_returnsServiceUnavailable() throws Exception {
        doThrow(new ContactDeliveryException("Discord unavailable"))
                .when(contactService)
                .processContactForm(any());

        performContactRequest(VALID_REQUEST, "198.51.100.16", true)
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.message")
                        .value("Unable to send your message right now. Please try again later."));

        verify(contactService).processContactForm(any());
    }

    @Test
    @DisplayName("should rate limit repeated contact submissions from same client")
    void submitContactForm_rateLimited_returnsTooManyRequests() throws Exception {
        String remoteAddress = "198.51.100.17";

        for (int attempt = 0; attempt < 5; attempt++) {
            performContactRequest(VALID_REQUEST, remoteAddress, true)
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("success"));
        }

        performContactRequest(VALID_REQUEST, remoteAddress, true)
                .andExpect(status().isTooManyRequests())
                .andExpect(header().exists("Retry-After"))
                .andExpect(jsonPath("$.message")
                        .value("You're sending messages too quickly. Please wait and try again."))
                .andExpect(jsonPath("$.retryAfterSeconds").isNumber());

        verify(contactService, times(5)).processContactForm(any());
    }

    private ResultActions performContactRequest(String requestBody, String remoteAddress, boolean includeCsrf) throws Exception {
        var requestBuilder = post(BASE_PATH)
                .with(remoteAddress(remoteAddress))
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody);

        if (includeCsrf) {
            requestBuilder.with(csrf());
        }

        return mockMvc.perform(requestBuilder);
    }

    private static RequestPostProcessor remoteAddress(String remoteAddress) {
        return request -> {
            request.setRemoteAddr(remoteAddress);
            return request;
        };
    }
}
