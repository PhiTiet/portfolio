package nl.personal.portfolio.api.core;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class HomePageServiceImplTest {

    private final HomePageServiceImpl sut = new HomePageServiceImpl();

    @Test
    void getDetails(){
        var result = sut.getDetails();
        assertThat(result.age()).isPositive();
        assertThat(result.programmerPeriod()).isPositive();
        assertThat(result.professionalProgrammerPeriod()).isPositive();
    }

}