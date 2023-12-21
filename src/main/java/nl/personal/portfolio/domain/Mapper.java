package nl.personal.portfolio.domain;

import java.util.List;

public interface Mapper<I, O> {
    public O map(I input);

    default List<O> map(List<I> input) {
        return input.stream().map(this::map).toList();
    }
}
