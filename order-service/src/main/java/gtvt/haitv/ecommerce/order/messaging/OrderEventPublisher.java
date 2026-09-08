package gtvt.haitv.ecommerce.order.messaging;

import gtvt.haitv.ecommerce.common.event.OrderEvent;
import gtvt.haitv.ecommerce.common.log.FlowLog;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Component
public class OrderEventPublisher {

    private final ObjectProvider<RabbitTemplate> rabbitTemplate;

    public OrderEventPublisher(ObjectProvider<RabbitTemplate> rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publishAfterCommit(OrderEvent event) {
        Runnable send = () -> send(event);
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    send.run();
                }
            });
        } else {
            send.run();
        }
    }

    private void send(OrderEvent event) {
        FlowLog f = FlowLog.start("mqPublish");
        RabbitTemplate template = rabbitTemplate.getIfAvailable();
        if (template == null) {
            f.end("skip no-rabbit " + event.getEventType());
            return;
        }
        if (event.getCorrelationId() == null) {
            event.setCorrelationId(FlowLog.cid());
        }
        try {
            template.convertAndSend(OrderEvent.EXCHANGE, OrderEvent.ROUTING_KEY, event);
            f.end(event.getEventType() + " orderId=" + event.getOrderId());
        } catch (Exception ex) {
            f.fail(event.getEventType());
        }
    }
}
