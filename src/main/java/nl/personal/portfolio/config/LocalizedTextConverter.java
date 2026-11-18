package nl.personal.portfolio.config;

import nl.personal.portfolio.domain.LocalizedText;
import org.springframework.boot.context.properties.ConfigurationPropertiesBinding;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

@Component
@ConfigurationPropertiesBinding
public class LocalizedTextConverter implements Converter<String, LocalizedText> {

    @Override
    public LocalizedText convert(String source) {
        return LocalizedText.of(source);
    }
}
