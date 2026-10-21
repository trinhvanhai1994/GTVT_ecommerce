package gtvt.haitv.ecommerce.shop.repository;

import gtvt.haitv.ecommerce.shop.entity.ShopMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ShopMemberRepository extends JpaRepository<ShopMember, Long> {
    Optional<ShopMember> findByShopIdAndUserIdAndStatus(Long shopId, Long userId, String status);
    boolean existsByShopIdAndUserIdAndStatus(Long shopId, Long userId, String status);
}
