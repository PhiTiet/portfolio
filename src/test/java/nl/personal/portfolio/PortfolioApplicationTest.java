package nl.personal.portfolio;

import jakarta.validation.ConstraintViolationException;
import nl.personal.portfolio.core.DiscordWebhookClient;
import nl.personal.portfolio.domain.ContactRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import tools.jackson.databind.json.JsonMapper;

import java.util.Set;
import java.util.stream.Stream;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.view;

@SpringBootTest
@AutoConfigureMockMvc
@Import(PortfolioApplicationTest.FailingController.class)
class PortfolioApplicationTest {

    private static final ContactRequest VALID_CONTACT = new ContactRequest("John Doe", "john@example.com", "Hello from the portfolio test.");

    @Autowired
    private MockMvc mvc;

    @Autowired
    private JsonMapper json;

    @MockitoBean
    private DiscordWebhookClient webhook;

    @ParameterizedTest
    @CsvSource({"en,Hire me.,A live Android app", "nl,Huur mij in.,Een live Android-app"})
    void rendersLocalizedPortfolio(String language, String heading, String projectDescription) throws Exception {
        mvc.perform(get("/").param("lang", language))
                .andExpect(status().isOk())
                .andExpect(view().name("home-page"))
                .andExpect(content().string(containsString("lang=\"" + language + "\"")))
                .andExpect(content().string(containsString(heading)))
                .andExpect(content().string(containsString(projectDescription)));
    }

    @ParameterizedTest
    @CsvSource({"/site.css,text/css", "/hero-scene.js,text/javascript", "/architecture-opening.js,text/javascript"})
    void servesBrowserAssets(String path, String contentType) throws Exception {
        mvc.perform(get(path)).andExpect(status().isOk()).andExpect(content().contentTypeCompatibleWith(contentType));
    }

    @Test
    void acceptsAnonymousContactWithoutCsrfAndForwardsTheMessage() throws Exception {
        contact(json.writeValueAsString(VALID_CONTACT))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("success"));

        verify(webhook).sendMessage(VALID_CONTACT);
    }

    @ParameterizedTest(name = "rejects invalid {0} ({index})")
    @MethodSource("invalidContacts")
    void rejectsInvalidContact(String field, ContactRequest request) throws Exception {
        contact(json.writeValueAsString(request))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.errors." + field).isNotEmpty());

        verifyNoInteractions(webhook);
    }

    static Stream<Arguments> invalidContacts() {
        return Stream.of(
                Arguments.of("name", new ContactRequest("", VALID_CONTACT.email(), VALID_CONTACT.message())),
                Arguments.of("name", new ContactRequest("x", VALID_CONTACT.email(), VALID_CONTACT.message())),
                Arguments.of("name", new ContactRequest("x".repeat(101), VALID_CONTACT.email(), VALID_CONTACT.message())),
                Arguments.of("email", new ContactRequest(VALID_CONTACT.name(), "not-an-email", VALID_CONTACT.message())),
                Arguments.of("email", new ContactRequest(VALID_CONTACT.name(), "x".repeat(243) + "@example.com", VALID_CONTACT.message())),
                Arguments.of("message", new ContactRequest(VALID_CONTACT.name(), VALID_CONTACT.email(), "Hi")),
                Arguments.of("message", new ContactRequest(VALID_CONTACT.name(), VALID_CONTACT.email(), "x".repeat(2001))),
                Arguments.of("name", new ContactRequest(null, null, null)));
    }

    @Test
    void rejectsMalformedContactJson() throws Exception {
        contact("{").andExpect(status().isBadRequest()).andExpect(view().name("error/400"));
        verifyNoInteractions(webhook);
    }

    @Test
    void rendersNotFoundForMissingPublicResources() throws Exception {
        mvc.perform(get("/home/missing")).andExpect(status().isNotFound()).andExpect(view().name("error/404"));
    }

    @ParameterizedTest
    @CsvSource({"true,400,error/400", "false,500,error/500"})
    void rendersErrorPages(boolean invalid, int status, String view) throws Exception {
        mvc.perform(get("/home/failure").param("invalid", String.valueOf(invalid)))
                .andExpect(status().is(status))
                .andExpect(view().name(view));
    }

    @Test
    void deniesAnonymousAccessOutsidePublicRoutes() throws Exception {
        mvc.perform(get("/private")).andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser
    void allowsAuthenticatedRequestsThroughSecurity() throws Exception {
        mvc.perform(get("/private")).andExpect(status().isNotFound());
    }

    private ResultActions contact(String body) throws Exception {
        return mvc.perform(post("/api/contact").param("lang", "en").contentType(MediaType.APPLICATION_JSON).content(body));
    }

    @RestController
    static class FailingController {
        @GetMapping("/home/failure")
        void fail(@RequestParam boolean invalid) {
            if (invalid) throw new ConstraintViolationException(Set.of());
            throw new IllegalStateException("Test failure");
        }
    }
}
