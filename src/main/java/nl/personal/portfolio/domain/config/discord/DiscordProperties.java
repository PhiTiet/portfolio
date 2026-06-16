package nl.personal.portfolio.domain.config.discord;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

@ConfigurationProperties(prefix = "portfolio.discord")
public record DiscordProperties(@DefaultValue("") String webhookUrl) {
}
