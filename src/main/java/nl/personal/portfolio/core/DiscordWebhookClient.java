package nl.personal.portfolio.core;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import java.util.Map;

@Component
public class DiscordWebhookClient {

    private static final Logger log = LoggerFactory.getLogger(DiscordWebhookClient.class);

    private final String webhookUrl;
    private final RestClient restClient;

    public DiscordWebhookClient(
            @Value("${portfolio.discord.webhook-url}") String webhookUrl,
            RestClient.Builder restClientBuilder) {
        this.webhookUrl = webhookUrl;
        this.restClient = restClientBuilder.build();
    }

    public void sendMessage(String name, String email, String message) {
        if (webhookUrl == null || webhookUrl.isBlank()) {
            log.error("Discord webhook URL not configured");
            throw new ContactDeliveryException("Discord webhook URL not configured");
        }

        try {
            var embed = Map.of(
                    "title", "New Contact Form Submission",
                    "color", 5814783,
                    "fields", new Object[]{
                            Map.of("name", "Name", "value", name, "inline", false),
                            Map.of("name", "Email", "value", email, "inline", false),
                            Map.of("name", "Message", "value", message, "inline", false)
                    }
            );

            var payload = Map.of("embeds", new Object[]{embed});

            restClient.post()
                    .uri(webhookUrl)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .toBodilessEntity();

            log.info("Successfully sent contact form to Discord");
        } catch (RestClientResponseException exception) {
            log.warn("Discord webhook rejected contact form with status {}", exception.getStatusCode());
            throw new ContactDeliveryException("Discord webhook rejected contact form", exception);
        } catch (RestClientException exception) {
            log.error("Failed to reach Discord webhook");
            throw new ContactDeliveryException("Failed to reach Discord webhook", exception);
        } catch (Exception exception) {
            log.error("Unexpected error while sending contact form to Discord");
            throw new ContactDeliveryException("Unexpected error while sending contact form", exception);
        }
    }
}
