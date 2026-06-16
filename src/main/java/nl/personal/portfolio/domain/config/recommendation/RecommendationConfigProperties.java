package nl.personal.portfolio.domain.config.recommendation;

import nl.personal.portfolio.domain.Recommendation;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@ConfigurationProperties(prefix = "recommendations")
public class RecommendationConfigProperties {

    private List<Recommendation> items;

    public List<Recommendation> getItems() {
        return items;
    }

    public void setItems(final List<Recommendation> items) {
        this.items = items;
    }
}
