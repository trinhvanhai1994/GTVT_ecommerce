package gtvt.haitv.ecommerce.notification.messaging;

import gtvt.haitv.ecommerce.common.event.OrderEvent;
import gtvt.haitv.ecommerce.common.log.FlowLog;
import gtvt.haitv.ecommerce.notification.service.NotificationService;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "spring.rabbitmq.host")
public class OrderEventListener {

    private final NotificationService notificationService;

    public OrderEventListener(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @RabbitListener(queues = OrderEvent.QUEUE)
    public void onMessage(OrderEvent event) {
        FlowLog.svc("NOTIFICATION-SERVICE");
        FlowLog.ensureCid(event.getCorrelationId());
        try {
            notificationService.handle(event);
        } catch (Exception ex) {
            FlowLog.start("mqListen").fail(event.getEventType());
        } finally {
            FlowLog.clear();
        }
    }
}
