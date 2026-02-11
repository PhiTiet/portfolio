package nl.personal.portfolio.factory;

import nl.personal.portfolio.domain.Icon;

public final class IconTestFactory {

    private IconTestFactory() {
    }

    public static Icon defaultIcon() {
        return new Icon("fa-solid fa-tasks", "--fa-primary-color: #2ecc71; --fa-secondary-color: #2ecc71;");
    }
}
