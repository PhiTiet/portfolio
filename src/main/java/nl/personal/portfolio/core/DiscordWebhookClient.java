package nl.personal.portfolio.core;

import nl.personal.portfolio.domain.config.discord.DiscordProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

@Component
public final class DiscordWebhookClient {

    private static final Logger log = LoggerFactory.getLogger(DiscordWebhookClient.class);

    private final String webhookUrl;
    private final RestClient restClient;

    public DiscordWebhookClient(final DiscordProperties discordProperties, final RestClient.Builder restClientBuilder) {
        this.webhookUrl = discordProperties.webhookUrl();
        this.restClient = restClientBuilder.build();
    }

    public void sendMessage(final String name, final String email, final String message) {
        if (webhookUrl == null || webhookUrl.isBlank()) {
            log.warn("Discord webhook URL not configured, skipping message send");
            return;
        }

        try {
            restClient.post()
                    .uri(webhookUrl)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload(name, email, message))
                    .retrieve()
                    .toBodilessEntity();

            log.info("Successfully sent contact form to Discord");
        } catch (Exception e) {
            log.error("Failed to send message to Discord webhook: {}", e.getMessage(), e);
        }
    }

    private static DiscordPayload payload(final String name, final String email, final String message) {
        return new DiscordPayload(List.of(new DiscordEmbed(
                "New Contact Form Submission",
                5814783,
                List.of(
                        new DiscordField("Name", name, false),
                        new DiscordField("Email", email, false),
                        new DiscordField("Message", message, false)
                )
        )));
    }

    record DiscordPayload(List<DiscordEmbed> embeds) {
    }

    record DiscordEmbed(String title, int color, List<DiscordField> fields) {
    }

    record DiscordField(String name, String value, boolean inline) {
    }
}
