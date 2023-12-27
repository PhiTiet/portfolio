package nl.personal.portfolio.factory;

import nl.personal.portfolio.domain.Hobby;

import static nl.personal.portfolio.factory.IconTestFactory.defaultIcon;

public class HobbyTestFactory {
    public static Hobby defaultHobby() {
        return new Hobby("hobby", defaultIcon());
    }
}
