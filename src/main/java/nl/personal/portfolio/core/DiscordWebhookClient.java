package nl.personal.portfolio.core;

import nl.personal.portfolio.domain.ContactRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;
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

    public void sendMessage(ContactRequest request) {
        if (webhookUrl == null || webhookUrl.isBlank()) {
            throw new ContactDeliveryException("Discord webhook URL is not configured", null);
        }

        var embed = Map.of(
                "title", "New Contact Form Submission",
                "color", 5814783,
                "description", request.message(),
                "fields", List.of(
                        Map.of("name", "Name", "value", request.name(), "inline", false),
                        Map.of("name", "Email", "value", request.email(), "inline", false)));
        var payload = Map.of(
                "embeds", List.of(embed),
                "allowed_mentions", Map.of("parse", List.of()));

        try {
            restClient.post()
                    .uri(webhookUrl)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientException e) {
            throw new ContactDeliveryException("Discord webhook delivery failed", e);
        }
        log.info("Contact form delivered to Discord - message length: {}", request.message().length());
    }
}
