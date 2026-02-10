package nl.personal.portfolio.api.advice;

import jakarta.validation.ConstraintViolationException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import static org.springframework.http.HttpStatus.*;

import lombok.extern.slf4j.Slf4j;

@ControllerAdvice
@Slf4j
public final class RestControllerExceptionAdvice {

    @ExceptionHandler({ConstraintViolationException.class, HttpMessageNotReadableException.class})
    @ResponseStatus(BAD_REQUEST)
    void badRequest(final Exception e) {
        log.info(e.getMessage(), e);
    }

    @ExceptionHandler({NoHandlerFoundException.class, NoResourceFoundException.class})
    @ResponseStatus(NOT_FOUND)
    void notFound(final Exception e) {
        log.info(e.getMessage(), e);
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(INTERNAL_SERVER_ERROR)
    void internalServerError(final Exception e) {
        log.error(e.getMessage(), e);
    }

}
