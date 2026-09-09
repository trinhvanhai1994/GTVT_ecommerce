package gtvt.haitv.ecommerce.notification.controller;

import gtvt.haitv.ecommerce.common.api.ApiResponse;
import gtvt.haitv.ecommerce.common.security.SecurityUtils;
import gtvt.haitv.ecommerce.notification.domain.Notification;
import gtvt.haitv.ecommerce.notification.service.NotificationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ApiResponse<List<Notification>> mine() {
        return ApiResponse.ok(notificationService.forUser(SecurityUtils.currentUserId()));
    }
}
