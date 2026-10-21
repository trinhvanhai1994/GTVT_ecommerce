package gtvt.haitv.ecommerce.shop.repository;

import gtvt.haitv.ecommerce.shop.entity.Shop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface ShopRepository extends JpaRepository<Shop, Long>, JpaSpecificationExecutor<Shop> {
    Optional<Shop> findBySlugIgnoreCase(String slug);
    boolean existsBySlugIgnoreCase(String slug);
    List<Shop> findByOwnerUserId(Long ownerUserId);
    boolean existsByOwnerUserIdAndStatusIn(Long ownerUserId, List<String> statuses);
}
