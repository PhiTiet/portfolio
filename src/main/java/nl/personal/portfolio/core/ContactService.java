package nl.personal.portfolio.core;

import nl.personal.portfolio.domain.ContactRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class ContactService {

    private static final Logger log = LoggerFactory.getLogger(ContactService.class);

    public void processContactForm(ContactRequest request) {
        log.debug("Received contact form from {} ({}) with message length: {}",
                request.name(),
                request.email(),
                request.message().length());

        log.info("Contact form submitted - message length: {}", request.message().length());

        // TODO: Implement email sending or notification service
        // For now, just log the contact request
    }
}
