package nl.personal.portfolio.api.advice;

import jakarta.validation.ConstraintViolationException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.servlet.NoHandlerFoundException;

import static org.springframework.http.HttpStatus.*;

@ControllerAdvice
public class RestControllerExceptionAdvice {

    @ExceptionHandler({ConstraintViolationException.class, HttpMessageNotReadableException.class})
    @ResponseStatus(BAD_REQUEST)
    private void badRequest(RuntimeException e){

    }

    @ExceptionHandler(NoHandlerFoundException.class)
    @ResponseStatus(NOT_FOUND)
    private void notFound(NoHandlerFoundException e){

    }

    @ExceptionHandler(Throwable.class)
    @ResponseStatus(INTERNAL_SERVER_ERROR)
    private void internalServerError(Exception e){

    }

}
