package nl.personal.portfolio.api.controller;

import jakarta.validation.Valid;
import nl.personal.portfolio.core.ContactService;
import nl.personal.portfolio.domain.ContactRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private final ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> submitContactForm(@Valid @RequestBody ContactRequest request) {
        contactService.processContactForm(request);
        return ResponseEntity.ok(Map.of("message", "success"));
    }
}
