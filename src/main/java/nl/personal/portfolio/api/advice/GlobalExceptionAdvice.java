package nl.personal.portfolio.api.advice;

import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import static org.springframework.http.HttpStatus.*;

@ControllerAdvice
public final class GlobalExceptionAdvice {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionAdvice.class);

    @ExceptionHandler({ConstraintViolationException.class, HttpMessageNotReadableException.class})
    @ResponseStatus(BAD_REQUEST)
    String badRequest(final Exception e) {
        log.info(e.getMessage());
        return "error/400";
    }

    @ExceptionHandler({NoHandlerFoundException.class, NoResourceFoundException.class})
    @ResponseStatus(NOT_FOUND)
    String notFound(final Exception e) {
        log.debug(e.getMessage());
        return "error/404";
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(INTERNAL_SERVER_ERROR)
    String internalServerError(final Exception e) {
        log.error(e.getMessage(), e);
        return "error/500";
    }

}
