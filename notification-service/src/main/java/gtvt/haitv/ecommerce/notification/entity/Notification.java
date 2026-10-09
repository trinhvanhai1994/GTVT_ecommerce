package gtvt.haitv.ecommerce.notification.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "event_type", nullable = false, length = 64)
    private String eventType;
    @Column(name = "user_id")
    private Long userId;
    @Column(name = "reference_id", length = 64)
    private String referenceId;
    @Column(nullable = false)
    private String title;
    @Column(nullable = false, length = 1024)
    private String message;
    @Column(nullable = false, length = 32)
    private String channel;
    @Column(nullable = false, length = 32)
    private String status;
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() { createdAt = Instant.now(); }
}
