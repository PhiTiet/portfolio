package nl.personal.portfolio.domain;

import java.util.Locale;

public record LocalizedText(String en, String nl) {

    public static LocalizedText of(String text) {
        return new LocalizedText(text, text);
    }

    public String in(Locale locale) {
        return "nl".equals(locale.getLanguage()) && nl != null ? nl : en;
    }
}
