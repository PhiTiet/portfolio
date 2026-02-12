package nl.personal.portfolio.domain;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ContactRequest(
        @NotBlank(message = "{contact.validation.name.required}")
        @Size(min = 2, max = 100, message = "{contact.validation.name.size}")
        String name,

        @NotBlank(message = "{contact.validation.email.required}")
        @Email(message = "{contact.validation.email.invalid}")
        @Size(max = 254, message = "{contact.validation.email.size}")
        String email,

        @NotBlank(message = "{contact.validation.message.required}")
        @Size(min = 10, max = 2000, message = "{contact.validation.message.size}")
        String message) {
}
