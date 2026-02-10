package nl.personal.portfolio.domain;

import java.time.format.DateTimeFormatter;

public final class DatePatterns {

    public static final String INPUT_FORMAT = "dd-MM-yyyy";
    public static final DateTimeFormatter DISPLAY_FORMAT = DateTimeFormatter.ofPattern("MM-yyyy");

    private DatePatterns() {
    }
}
