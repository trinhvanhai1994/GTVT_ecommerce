package gtvt.haitv.ecommerce.product.service;

import gtvt.haitv.ecommerce.common.constant.ErrorConstant;
import gtvt.haitv.ecommerce.common.constant.MessageConstant;
import gtvt.haitv.ecommerce.common.exception.ApiException;
import gtvt.haitv.ecommerce.common.log.FlowLog;
import gtvt.haitv.ecommerce.common.security.SecurityUtils;
import gtvt.haitv.ecommerce.product.client.ShopClient;
import gtvt.haitv.ecommerce.product.dto.CategoryRequest;
import gtvt.haitv.ecommerce.product.dto.CategoryResponse;
import gtvt.haitv.ecommerce.product.dto.PageResponse;
import gtvt.haitv.ecommerce.product.dto.ProductRequest;
import gtvt.haitv.ecommerce.product.dto.ProductResponse;
import gtvt.haitv.ecommerce.product.entity.Category;
import gtvt.haitv.ecommerce.product.entity.Product;
import gtvt.haitv.ecommerce.product.repository.CategoryRepository;
import gtvt.haitv.ecommerce.product.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
public class ProductCatalogService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ShopClient shopClient;

    public ProductCatalogService(ProductRepository productRepository, CategoryRepository categoryRepository,
                                 ShopClient shopClient) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.shopClient = shopClient;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> listCategories(Long shopId) {
        if (shopId == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, ErrorConstant.VALIDATION_ERROR, "shopId is required");
        }
        return categoryRepository.findByShopIdOrderByNameAsc(shopId).stream().map(CategoryResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public CategoryResponse getCategory(Long id) {
        return CategoryResponse.from(category(id));
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        requireShopAccess(request.getShopId());
        if (categoryRepository.existsByShopIdAndNameIgnoreCase(request.getShopId(), request.getName())) {
            throw new ApiException(HttpStatus.CONFLICT, ErrorConstant.CATEGORY_EXISTS, MessageConstant.CATEGORY_EXISTS);
        }
        Category c = new Category();
        c.setShopId(request.getShopId());
        c.setName(request.getName());
        c.setDescription(request.getDescription());
        return CategoryResponse.from(categoryRepository.save(c));
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category c = category(id);
        requireShopAccess(c.getShopId());
        c.setName(request.getName());
        c.setDescription(request.getDescription());
        return CategoryResponse.from(c);
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category c = category(id);
        requireShopAccess(c.getShopId());
        categoryRepository.delete(c);
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> search(Long shopId, String keyword, Long categoryId, String brand,
                                                BigDecimal minPrice, BigDecimal maxPrice, String status,
                                                int page, int size) {
        FlowLog f = FlowLog.start("searchProducts");
        Specification<Product> spec = (root, q, cb) -> cb.conjunction();
        if (shopId != null) {
            spec = spec.and((root, q, cb) -> cb.equal(root.get("shopId"), shopId));
        }
        if (StringUtils.hasText(keyword)) {
            spec = spec.and((root, q, cb) -> cb.like(cb.lower(root.get("name")), "%" + keyword.toLowerCase() + "%"));
        }
        if (categoryId != null) {
            spec = spec.and((root, q, cb) -> cb.equal(root.get("categoryId"), categoryId));
        }
        if (StringUtils.hasText(brand)) {
            spec = spec.and((root, q, cb) -> cb.equal(cb.lower(root.get("brand")), brand.toLowerCase()));
        }
        if (minPrice != null) {
            spec = spec.and((root, q, cb) -> cb.greaterThanOrEqualTo(root.get("price"), minPrice));
        }
        if (maxPrice != null) {
            spec = spec.and((root, q, cb) -> cb.lessThanOrEqualTo(root.get("price"), maxPrice));
        }
        if (StringUtils.hasText(status)) {
            spec = spec.and((root, q, cb) -> cb.equal(root.get("status"), status));
        }
        Page<ProductResponse> result = productRepository.findAll(spec, PageRequest.of(page, size)).map(ProductResponse::from);
        f.end("page=" + page + " n=" + result.getNumberOfElements());
        return PageResponse.from(result);
    }

    @Transactional(readOnly = true)
    public ProductResponse getProduct(Long id) {
        return ProductResponse.from(product(id));
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        requireShopAccess(request.getShopId());
        Category cat = category(request.getCategoryId());
        if (!cat.getShopId().equals(request.getShopId())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, ErrorConstant.VALIDATION_ERROR, "Category does not belong to shop");
        }
        Product p = new Product();
        apply(p, request);
        return ProductResponse.from(productRepository.save(p));
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product p = product(id);
        requireShopAccess(p.getShopId());
        Category cat = category(request.getCategoryId());
        if (!cat.getShopId().equals(p.getShopId())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, ErrorConstant.VALIDATION_ERROR, "Category does not belong to shop");
        }
        apply(p, request);
        p.setShopId(p.getShopId());
        return ProductResponse.from(p);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product p = product(id);
        requireShopAccess(p.getShopId());
        productRepository.delete(p);
    }

    private void requireShopAccess(Long shopId) {
        if (SecurityUtils.isAdmin()) {
            return;
        }
        Long userId = SecurityUtils.currentUserId();
        Map<String, Boolean> member = shopClient.member(shopId, userId).getData();
        if (member == null || !Boolean.TRUE.equals(member.get("member"))) {
            throw new ApiException(HttpStatus.FORBIDDEN, ErrorConstant.FORBIDDEN, MessageConstant.FORBIDDEN);
        }
        Map<String, Boolean> approved = shopClient.approved(shopId).getData();
        if (approved == null || !Boolean.TRUE.equals(approved.get("approved"))) {
            throw new ApiException(HttpStatus.BAD_REQUEST, ErrorConstant.VALIDATION_ERROR, "Shop is not approved");
        }
    }

    private void apply(Product p, ProductRequest request) {
        p.setShopId(request.getShopId());
        p.setName(request.getName());
        p.setDescription(request.getDescription());
        p.setPrice(request.getPrice());
        p.setCategoryId(request.getCategoryId());
        p.setBrand(request.getBrand());
        p.setImageUrl(request.getImageUrl());
        p.setStatus(request.getStatus() == null ? "ACTIVE" : request.getStatus());
    }

    private Category category(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, ErrorConstant.CATEGORY_NOT_FOUND, MessageConstant.CATEGORY_NOT_FOUND));
    }

    private Product product(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, ErrorConstant.PRODUCT_NOT_FOUND, MessageConstant.PRODUCT_NOT_FOUND));
    }
}
