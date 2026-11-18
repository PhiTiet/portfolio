package nl.personal.portfolio.config;

import jakarta.validation.constraints.NotEmpty;
import nl.personal.portfolio.domain.Recommendation;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.util.List;

@Validated
@ConfigurationProperties("recommendations")
public record RecommendationProperties(@NotEmpty List<Recommendation> items) {
}
