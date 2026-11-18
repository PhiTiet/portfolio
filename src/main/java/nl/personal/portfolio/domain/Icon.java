package nl.personal.portfolio.domain;

public record Icon(String name, String color, String animation) {

    public String symbolId() {
        return name.replace('/', '-');
    }
}
