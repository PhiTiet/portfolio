package nl.personal.portfolio.api.advice;

import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.HashMap;
import java.util.Map;

import static org.springframework.http.HttpStatus.*;

@ControllerAdvice
public final class GlobalExceptionAdvice {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionAdvice.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(BAD_REQUEST)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(MethodArgumentNotValidException e) {
        Map<String, Object> errors = new HashMap<>();
        errors.put("message", "Validation failed");

        Map<String, String> fieldErrors = new HashMap<>();
        e.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            fieldErrors.put(fieldName, errorMessage);
        });
        errors.put("errors", fieldErrors);

        return ResponseEntity.badRequest().body(errors);
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

}
