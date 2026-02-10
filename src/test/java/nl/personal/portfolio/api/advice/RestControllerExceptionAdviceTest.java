package nl.personal.portfolio.api.advice;

import jakarta.validation.ConstraintViolationException;
import lombok.Setter;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import static org.junit.jupiter.params.provider.Arguments.arguments;
import static org.mockito.Mockito.mock;
import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(RestControllerExceptionAdvice.class)
@Import(RestControllerExceptionAdviceTest.TestController.class)
@DisplayName("RestControllerExceptionAdvice")
class RestControllerExceptionAdviceTest {

    public static final String TEST_EXCEPTION_URL = "/anonymous/test_exception";

    @Autowired
    private TestController testController;

    @Autowired
    private MockMvc mockMvc;

    @ParameterizedTest(name = "{0} must result in {1}")
    @MethodSource("exceptionTestCases")
    @WithMockUser
    @DisplayName("should map exceptions to correct HTTP status")
    void exceptionHandling(Exception exception, HttpStatus httpStatus) throws Exception {
        testController.setException(exception);
        mockMvc.perform(get(TEST_EXCEPTION_URL)).andExpect(status().is(httpStatus.value()));
    }

    static List<Arguments> exceptionTestCases() {
        return List.of(
                arguments(mock(ConstraintViolationException.class), BAD_REQUEST),
                arguments(mock(HttpMessageNotReadableException.class), BAD_REQUEST),
                arguments(mock(RuntimeException.class), INTERNAL_SERVER_ERROR),
                arguments(mock(Exception.class), INTERNAL_SERVER_ERROR)
        );
    }

    @Setter
    @RestController
    static class TestController {
        private Exception exception;

        @GetMapping(TEST_EXCEPTION_URL)
        public void get() throws Exception {
            throw exception;
        }
    }
}
