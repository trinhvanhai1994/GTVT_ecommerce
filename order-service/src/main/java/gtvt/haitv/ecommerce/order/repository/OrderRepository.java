package gtvt.haitv.ecommerce.order.repository;

import gtvt.haitv.ecommerce.order.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserIdOrderByIdDesc(Long userId);
    List<Order> findByShopIdOrderByIdDesc(Long shopId);
    List<Order> findByShopIdAndCreatedAtAfterOrderByCreatedAtAsc(Long shopId, Instant after);
}
