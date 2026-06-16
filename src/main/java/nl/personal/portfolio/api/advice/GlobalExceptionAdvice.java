package nl.personal.portfolio.api.advice;

import jakarta.validation.ConstraintViolationException;
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
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.*;

@ControllerAdvice
public final class GlobalExceptionAdvice {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionAdvice.class);

    private final MessageSource messageSource;
    private final LocaleResolver localeResolver;

    public GlobalExceptionAdvice(final MessageSource messageSource, final LocaleResolver localeResolver) {
        this.messageSource = messageSource;
        this.localeResolver = localeResolver;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ValidationErrorResponse> handleValidationErrors(
            final MethodArgumentNotValidException e,
            final HttpServletRequest request) {
        var locale = localeResolver.resolveLocale(request);
        var message = messageSource.getMessage("contact.validation.failed", null, "Validation failed", locale);

        return ResponseEntity.badRequest().body(new ValidationErrorResponse(message, fieldErrors(e)));
    }

    private static Map<String, String> fieldErrors(final MethodArgumentNotValidException exception) {
        return exception.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(
                        fieldError -> fieldError.getField(),
                        fieldError -> fieldError.getDefaultMessage(),
                        (first, ignored) -> first,
                        LinkedHashMap::new
                ));
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

    public record ValidationErrorResponse(String message, Map<String, String> errors) {
    }
}
