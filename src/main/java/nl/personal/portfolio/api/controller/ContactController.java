package nl.personal.portfolio.api.controller;

import jakarta.validation.Valid;
import nl.personal.portfolio.core.DiscordWebhookClient;
import nl.personal.portfolio.domain.ContactRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private static final Logger log = LoggerFactory.getLogger(ContactController.class);

    private final DiscordWebhookClient webhookClient;

    public ContactController(DiscordWebhookClient webhookClient) {
        this.webhookClient = webhookClient;
    }

    @PostMapping
    public Map<String, String> submitContactForm(@Valid @RequestBody ContactRequest request) {
        if (request.isSpam()) {
            log.info("Contact form dropped by honeypot");
        } else {
            webhookClient.sendMessage(request);
        }
        return Map.of("message", "success");
    }
}
