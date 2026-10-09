package gtvt.haitv.ecommerce.notification;

import gtvt.haitv.ecommerce.common.event.OrderEvent;
import gtvt.haitv.ecommerce.notification.repository.NotificationRepository;
import gtvt.haitv.ecommerce.notification.service.NotificationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
@ActiveProfiles("test")
class NotificationServiceTests {

    @Autowired NotificationService notificationService;
    @Autowired NotificationRepository repository;

    @Test
    void consumeEventPersists() {
        OrderEvent event = new OrderEvent(OrderEvent.ORDER_CONFIRMED, 1L, 10L, "Confirmed", "ok");
        notificationService.handle(event);
        assertEquals(1, repository.count());
        assertEquals("ORDER_CONFIRMED", repository.findAll().getFirst().getEventType());
    }

    @Test
    void consumeEventWithEmailWhenMailDisabledStillPersists() {
        repository.deleteAll();
        OrderEvent event = new OrderEvent(
                OrderEvent.ORDER_CONFIRMED, 2L, 11L, "customer@example.com", "Confirmed", "ok");
        notificationService.handle(event);
        assertEquals(1, repository.count());
        var saved = repository.findAll().getFirst();
        assertEquals("ORDER_CONFIRMED", saved.getEventType());
        assertEquals("CONSOLE", saved.getChannel());
        assertEquals("SENT", saved.getStatus());
    }
}
