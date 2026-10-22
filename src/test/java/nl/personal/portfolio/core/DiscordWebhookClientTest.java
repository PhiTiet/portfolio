package nl.personal.portfolio.core;

import nl.personal.portfolio.domain.ContactRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.springframework.http.HttpMethod.POST;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class DiscordWebhookClientTest {

    private static final String WEBHOOK_URL = "https://discord.example/webhook";
    private static final ContactRequest CONTACT = new ContactRequest("John Doe", "john@example.com", "Hello from the portfolio.");
    private final RestClient.Builder builder = RestClient.builder();
    private final MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();

    @Test
    void sendsContactAsDiscordEmbed() {
        server.expect(requestTo(WEBHOOK_URL))
                .andExpect(method(POST))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(content().json("""
                        {"embeds":[{"title":"New Contact Form Submission","color":5814783,"fields":[
                          {"name":"Name","value":"John Doe","inline":false},
                          {"name":"Email","value":"john@example.com","inline":false},
                          {"name":"Message","value":"Hello from the portfolio.","inline":false}
                        ]}]}
                        """))
                .andRespond(withSuccess());

        new DiscordWebhookClient(WEBHOOK_URL, builder).sendMessage(CONTACT);

        server.verify();
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = " ")
    void skipsDeliveryWithoutWebhookUrl(String url) {
        new DiscordWebhookClient(url, builder).sendMessage(CONTACT);
        server.verify();
    }

    @Test
    void webhookFailureDoesNotFailContactSubmission() {
        server.expect(requestTo(WEBHOOK_URL)).andRespond(withServerError());

        assertThatCode(() -> new DiscordWebhookClient(WEBHOOK_URL, builder).sendMessage(CONTACT)).doesNotThrowAnyException();

        server.verify();
    }
}
