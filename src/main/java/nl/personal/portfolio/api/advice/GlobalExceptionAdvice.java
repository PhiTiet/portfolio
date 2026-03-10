package nl.personal.portfolio.api.advice;

import jakarta.validation.ConstraintViolationException;
import nl.personal.portfolio.api.security.ContactRateLimitExceededException;
import nl.personal.portfolio.core.ContactDeliveryException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.MessageSource;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

import static org.springframework.http.HttpStatus.*;

@ControllerAdvice
public final class GlobalExceptionAdvice {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionAdvice.class);

    private final MessageSource messageSource;
    private final LocaleResolver localeResolver;

    public GlobalExceptionAdvice(MessageSource messageSource, LocaleResolver localeResolver) {
        this.messageSource = messageSource;
        this.localeResolver = localeResolver;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(MethodArgumentNotValidException e, HttpServletRequest request) {
        Map<String, Object> errors = new HashMap<>();
        errors.put("message", resolveMessage(request, "contact.validation.failed", "Validation failed"));

        Map<String, String> fieldErrors = new HashMap<>();
        e.getBindingResult().getFieldErrors().forEach(error -> {
            fieldErrors.put(error.getField(), error.getDefaultMessage());
        });
        errors.put("errors", fieldErrors);

        return ResponseEntity.badRequest().body(errors);
    }

    @ExceptionHandler(ContactDeliveryException.class)
    public ResponseEntity<Map<String, String>> handleContactDeliveryFailure(ContactDeliveryException exception,
                                                                            HttpServletRequest request) {
        return ResponseEntity.status(SERVICE_UNAVAILABLE).body(Map.of(
                "message", resolveMessage(request, "contact.delivery.failed",
                        "Unable to send your message right now. Please try again later.")));
    }

    @ExceptionHandler(ContactRateLimitExceededException.class)
    public ResponseEntity<Map<String, Object>> handleContactRateLimitExceeded(ContactRateLimitExceededException exception,
                                                                              HttpServletRequest request) {
        return ResponseEntity.status(TOO_MANY_REQUESTS)
                .header("Retry-After", String.valueOf(exception.getRetryAfterSeconds()))
                .body(Map.of(
                        "message", resolveMessage(request, "contact.rate.limit.exceeded",
                                "You're sending messages too quickly. Please wait and try again."),
                        "retryAfterSeconds", exception.getRetryAfterSeconds()));
    }

    @ExceptionHandler({ConstraintViolationException.class, HttpMessageNotReadableException.class})
    @ResponseStatus(BAD_REQUEST)
    String badRequest(final Exception e) {
        log.info(e.getMessage(), e);
        return "error/400";
    }

    @ExceptionHandler({NoHandlerFoundException.class, NoResourceFoundException.class})
    @ResponseStatus(NOT_FOUND)
    String notFound(final Exception e) {
        log.info(e.getMessage(), e);
        return "error/404";
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(INTERNAL_SERVER_ERROR)
    String internalServerError(final Exception e) {
        log.error(e.getMessage(), e);
        return "error/500";
    }

    private String resolveMessage(HttpServletRequest request, String key, String defaultMessage, Object... args) {
        var locale = localeResolver.resolveLocale(request);
        return messageSource.getMessage(key, args, defaultMessage, locale);
    }

}
