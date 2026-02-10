package nl.personal.portfolio.api.security;

import org.junit.jupiter.api.Nested;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultMatcher;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityConfigurationTest {

    public static final String ANONYMOUS_URL = "/home/test";
    public static final String AUTHENTICATED_URL = "/authenticated/test";

    @Autowired
    private MockMvc mockMvc;

    @Nested
    class AnonymousTest {
        @ParameterizedTest
        @MethodSource("testCases")
        void anonymous(String url, ResultMatcher resultMatcher) throws Exception {
            mockMvc.perform(get(url)).andExpect(resultMatcher);
        }

        static List<Arguments> testCases(){
            return List.of(
                    Arguments.arguments(ANONYMOUS_URL, status().is2xxSuccessful()),
                    Arguments.arguments(AUTHENTICATED_URL, status().isForbidden())
            );
        }
    }

    @Nested
    @WithMockUser
    class AuthenticatedTest {
        @ParameterizedTest
        @MethodSource("testCases")
        void anonymous(String url, ResultMatcher resultMatcher) throws Exception {
            mockMvc.perform(get(url)).andExpect(resultMatcher);
        }

        static List<Arguments> testCases(){
            return List.of(
                    Arguments.arguments(ANONYMOUS_URL, status().is2xxSuccessful()),
                    Arguments.arguments(AUTHENTICATED_URL, status().is2xxSuccessful())
            );
        }
    }


    @RestController
    static class TestController {
        @GetMapping(ANONYMOUS_URL)
        public void getAnonymous(){

        }

        @GetMapping(AUTHENTICATED_URL)
        public void getAuthenticated(){

        }
    }

}
