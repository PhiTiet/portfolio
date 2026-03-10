package nl.personal.portfolio.core;

public final class ContactDeliveryException extends RuntimeException {

    public ContactDeliveryException(String message) {
        super(message);
    }

    public ContactDeliveryException(String message, Throwable cause) {
        super(message, cause);
    }
}
