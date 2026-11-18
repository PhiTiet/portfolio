package nl.personal.portfolio;

import jakarta.validation.ConstraintViolationException;
import nl.personal.portfolio.core.ContactDeliveryException;
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
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import tools.jackson.databind.json.JsonMapper;

import java.util.Set;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.view;

@SpringBootTest
@AutoConfigureMockMvc
@Import(PortfolioApplicationTest.FailingController.class)
class PortfolioApplicationTest {

    private static final ContactRequest VALID_CONTACT = new ContactRequest("John Doe", "john@example.com", "Hello from the portfolio test.", null);

    @Autowired
    private MockMvc mvc;

    @Autowired
    private JsonMapper json;

    @MockitoBean
    private DiscordWebhookClient webhook;

    @ParameterizedTest
    @CsvSource({"/,en,Hire me.,A live Android app,Storage employee", "/nl/,nl,Huur mij in.,Een live Android-app,Magazijnmedewerker"})
    void rendersLocalizedPortfolio(String path, String language, String heading, String projectDescription, String jobTitle) throws Exception {
        mvc.perform(get(path))
                .andExpect(status().isOk())
                .andExpect(view().name("home-page"))
                .andExpect(content().string(containsString("lang=\"" + language + "\"")))
                .andExpect(content().string(containsString(heading)))
                .andExpect(content().string(containsString(projectDescription)))
                .andExpect(content().string(containsString(jobTitle)))
                .andExpect(content().string(containsString("<link rel=\"canonical\" href=\"https://phitiet.nl" + path + "\">")));
    }

    @ParameterizedTest
    @CsvSource({"en,/", "nl,/nl/"})
    void redirectsLegacyLanguageLinks(String language, String location) throws Exception {
        mvc.perform(get("/").param("lang", language))
                .andExpect(status().isMovedPermanently())
                .andExpect(header().string("Location", location));
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
                .andExpect(jsonPath("$.detail").value("Validation failed"))
                .andExpect(jsonPath("$.errors." + field).isNotEmpty());

        verifyNoInteractions(webhook);
    }

    static Stream<Arguments> invalidContacts() {
        return Stream.of(
                Arguments.of("name", new ContactRequest("", VALID_CONTACT.email(), VALID_CONTACT.message(), null)),
                Arguments.of("name", new ContactRequest("x", VALID_CONTACT.email(), VALID_CONTACT.message(), null)),
                Arguments.of("name", new ContactRequest("x".repeat(101), VALID_CONTACT.email(), VALID_CONTACT.message(), null)),
                Arguments.of("email", new ContactRequest(VALID_CONTACT.name(), "not-an-email", VALID_CONTACT.message(), null)),
                Arguments.of("email", new ContactRequest(VALID_CONTACT.name(), "x".repeat(243) + "@example.com", VALID_CONTACT.message(), null)),
                Arguments.of("message", new ContactRequest(VALID_CONTACT.name(), VALID_CONTACT.email(), "Hi", null)),
                Arguments.of("message", new ContactRequest(VALID_CONTACT.name(), VALID_CONTACT.email(), "x".repeat(2001), null)),
                Arguments.of("name", new ContactRequest(null, null, null, null)));
    }

    @Test
    void rejectsMalformedContactJson() throws Exception {
        contact("{").andExpect(status().isBadRequest()).andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON));
        verifyNoInteractions(webhook);
    }

    @Test
    void dropsHoneypotSubmissionsWithoutForwarding() throws Exception {
        var spam = new ContactRequest(VALID_CONTACT.name(), VALID_CONTACT.email(), VALID_CONTACT.message(), "https://spam.example");

        contact(json.writeValueAsString(spam)).andExpect(status().isOk());

        verifyNoInteractions(webhook);
    }

    @Test
    void reportsFailedDeliveryToTheVisitor() throws Exception {
        doThrow(new ContactDeliveryException("Discord is down", null)).when(webhook).sendMessage(VALID_CONTACT);

        contact(json.writeValueAsString(VALID_CONTACT))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.detail").value("Your message could not be sent. Please try again later."));
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
    void rendersNotFoundForUnknownRoutes() throws Exception {
        mvc.perform(get("/private")).andExpect(status().isNotFound()).andExpect(view().name("error/404"));
    }

    @Test
    void reportsHealthForContainerChecks() throws Exception {
        mvc.perform(get("/actuator/health")).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    void doesNotCreateSessionsForVisitors() throws Exception {
        mvc.perform(get("/")).andExpect(result -> assertThat(result.getRequest().getSession(false)).isNull());
    }

    private ResultActions contact(String body) throws Exception {
        return mvc.perform(post("/api/contact").header("Accept-Language", "en").contentType(MediaType.APPLICATION_JSON).content(body));
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
