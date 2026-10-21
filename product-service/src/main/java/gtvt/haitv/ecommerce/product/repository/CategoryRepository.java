package gtvt.haitv.ecommerce.product.repository;

import gtvt.haitv.ecommerce.product.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    boolean existsByShopIdAndNameIgnoreCase(Long shopId, String name);
    List<Category> findByShopIdOrderByNameAsc(Long shopId);
}
