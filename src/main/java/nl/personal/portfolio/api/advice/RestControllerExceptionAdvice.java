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
public class RestControllerExceptionAdvice {

    @ExceptionHandler({ConstraintViolationException.class, HttpMessageNotReadableException.class})
    @ResponseStatus(BAD_REQUEST)
    private void badRequest(Exception e){
        log.info(e.getMessage(), e);
    }

    @ExceptionHandler({NoHandlerFoundException.class, NoResourceFoundException.class})
    @ResponseStatus(NOT_FOUND)
    private void notFound(Exception e){
        log.info(e.getMessage(), e);
    }

    @ExceptionHandler(Throwable.class)
    @ResponseStatus(INTERNAL_SERVER_ERROR)
    private void internalServerError(Exception e){
        log.error(e.getMessage(), e);
    }

}
