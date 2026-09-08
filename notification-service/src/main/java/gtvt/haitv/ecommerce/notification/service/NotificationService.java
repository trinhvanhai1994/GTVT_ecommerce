package gtvt.haitv.ecommerce.notification.service;

import gtvt.haitv.ecommerce.common.event.OrderEvent;
import gtvt.haitv.ecommerce.common.log.FlowLog;
import gtvt.haitv.ecommerce.notification.domain.Notification;
import gtvt.haitv.ecommerce.notification.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository repository;

    public NotificationService(NotificationRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public void handle(OrderEvent event) {
        FlowLog f = FlowLog.start("notify");
        Notification n = new Notification();
        n.setEventType(event.getEventType());
        n.setUserId(event.getUserId());
        n.setReferenceId(event.getOrderId() == null ? null : String.valueOf(event.getOrderId()));
        n.setTitle(event.getTitle() == null ? event.getEventType() : event.getTitle());
        n.setMessage(event.getMessage() == null ? event.getEventType() : event.getMessage());
        n.setChannel("CONSOLE");
        n.setStatus("SENT");
        repository.save(n);
        f.end(event.getEventType() + " userId=" + event.getUserId() + " orderId=" + event.getOrderId());
    }

    @Transactional(readOnly = true)
    public List<Notification> forUser(Long userId) {
        FlowLog f = FlowLog.start("listNotify");
        var list = repository.findByUserIdOrderByIdDesc(userId);
        f.end("n=" + list.size());
        return list;
    }
}
