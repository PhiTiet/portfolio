package nl.personal.portfolio.api.controller;

import jakarta.validation.Valid;
import nl.personal.portfolio.core.DiscordWebhookClient;
import nl.personal.portfolio.domain.ContactRequest;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private final DiscordWebhookClient webhookClient;

    public ContactController(DiscordWebhookClient webhookClient) {
        this.webhookClient = webhookClient;
    }

    @PostMapping
    public Map<String, String> submitContactForm(@Valid @RequestBody ContactRequest request) {
        webhookClient.sendMessage(request);
        return Map.of("message", "success");
    }
}
