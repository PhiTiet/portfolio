package nl.personal.portfolio.core;

import nl.personal.portfolio.domain.ContactRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class ContactService {

    private static final Logger log = LoggerFactory.getLogger(ContactService.class);

    private final DiscordWebhookClient discordWebhookClient;

    public ContactService(DiscordWebhookClient discordWebhookClient) {
        this.discordWebhookClient = discordWebhookClient;
    }

    public void processContactForm(ContactRequest request) {
        log.debug("Received contact form from {} with message length: {}",
                request.name(),
                request.message().length());

        log.info("Contact form submitted - message length: {}", request.message().length());

        discordWebhookClient.sendMessage(request.name(), request.email(), request.message());
    }
}
