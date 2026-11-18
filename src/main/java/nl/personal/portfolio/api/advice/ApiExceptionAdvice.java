package nl.personal.portfolio.api.advice;

import nl.personal.portfolio.api.controller.ContactController;
import nl.personal.portfolio.core.ContactDeliveryException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.util.LinkedHashMap;
import java.util.Map;

import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;
import static org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE;

@Order(Ordered.HIGHEST_PRECEDENCE)
@RestControllerAdvice(assignableTypes = ContactController.class)
public class ApiExceptionAdvice extends ResponseEntityExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(ApiExceptionAdvice.class);

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException e, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        Map<String, String> errors = new LinkedHashMap<>();
        e.getBindingResult().getFieldErrors().forEach(error -> errors.putIfAbsent(error.getField(), error.getDefaultMessage()));
        var problem = e.getBody();
        problem.setDetail(message("contact.validation.failed", "Validation failed"));
        problem.setProperty("errors", errors);
        return handleExceptionInternal(e, problem, headers, status, request);
    }

    @ExceptionHandler(ContactDeliveryException.class)
    ProblemDetail deliveryFailed(ContactDeliveryException e) {
        log.error(e.getMessage(), e);
        return ProblemDetail.forStatusAndDetail(SERVICE_UNAVAILABLE,
                message("contact.form.error.delivery", "Your message could not be sent. Please try again later."));
    }

    @ExceptionHandler(Exception.class)
    ProblemDetail unexpected(Exception e) {
        log.error(e.getMessage(), e);
        return ProblemDetail.forStatusAndDetail(INTERNAL_SERVER_ERROR,
                message("error.500.message", "An unexpected error occurred. Please try again later."));
    }

    private String message(String code, String fallback) {
        var source = getMessageSource();
        return source == null ? fallback : source.getMessage(code, null, fallback, LocaleContextHolder.getLocale());
    }
}
