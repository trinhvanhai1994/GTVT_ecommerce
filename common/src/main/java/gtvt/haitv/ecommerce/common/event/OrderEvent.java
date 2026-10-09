package gtvt.haitv.ecommerce.common.event;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
public class OrderEvent {

    public static final String ORDER_CREATED = "ORDER_CREATED";
    public static final String ORDER_CONFIRMED = "ORDER_CONFIRMED";
    public static final String PAYMENT_SUCCESS = "PAYMENT_SUCCESS";
    public static final String PAYMENT_FAILED = "PAYMENT_FAILED";
    public static final String ORDER_SHIPPED = "ORDER_SHIPPED";
    public static final String ORDER_DELIVERED = "ORDER_DELIVERED";
    public static final String ORDER_CANCELLED = "ORDER_CANCELLED";
    public static final String ORDER_STATUS_UPDATED = "ORDER_STATUS_UPDATED";

    public static final String EXCHANGE = "ecommerce.events";
    public static final String QUEUE = "notification.events";
    public static final String ROUTING_KEY = "order.event";

    private String eventType;
    private Long userId;
    private Long orderId;
    private Long paymentId;
    private String email;
    private String title;
    private String message;
    private String correlationId;
    private Instant occurredAt = Instant.now();

    public OrderEvent(String eventType, Long userId, Long orderId, String title, String message) {
        this.eventType = eventType;
        this.userId = userId;
        this.orderId = orderId;
        this.title = title;
        this.message = message;
    }

    public OrderEvent(String eventType, Long userId, Long orderId, String email, String title, String message) {
        this(eventType, userId, orderId, title, message);
        this.email = email;
    }
}
