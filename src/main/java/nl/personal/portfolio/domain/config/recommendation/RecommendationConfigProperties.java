package nl.personal.portfolio.domain.config.recommendation;

import lombok.Data;
import nl.personal.portfolio.domain.Recommendation;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@Data
@ConfigurationProperties(prefix = "recommendations")
public class RecommendationConfigProperties {

    private List<Recommendation> items;
}
