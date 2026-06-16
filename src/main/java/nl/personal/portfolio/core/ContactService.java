package nl.personal.portfolio.core;

import nl.personal.portfolio.domain.ContactRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public final class ContactService {

    private static final Logger log = LoggerFactory.getLogger(ContactService.class);

    private final DiscordWebhookClient discordWebhookClient;

    public ContactService(final DiscordWebhookClient discordWebhookClient) {
        this.discordWebhookClient = discordWebhookClient;
    }

    public void processContactForm(final ContactRequest request) {
        var messageLength = request.message().length();

        log.debug("Received contact form from {} with message length: {}", request.name(), messageLength);
        log.info("Contact form submitted - message length: {}", messageLength);

        discordWebhookClient.sendMessage(request.name(), request.email(), request.message());
    }
}
