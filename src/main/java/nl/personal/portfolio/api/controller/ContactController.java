package nl.personal.portfolio.api.controller;

import jakarta.validation.Valid;
import nl.personal.portfolio.core.ContactService;
import nl.personal.portfolio.domain.ContactRequest;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/contact")
public final class ContactController {

    private static final ContactSubmissionResponse SUCCESS = new ContactSubmissionResponse("success");

    private final ContactService contactService;

    public ContactController(final ContactService contactService) {
        this.contactService = contactService;
    }

    @PostMapping
    public ContactSubmissionResponse submitContactForm(@Valid @RequestBody final ContactRequest request) {
        contactService.processContactForm(request);
        return SUCCESS;
    }

    public record ContactSubmissionResponse(String message) {
    }
}
