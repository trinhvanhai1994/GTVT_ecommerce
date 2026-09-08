package gtvt.haitv.ecommerce.product.service;

import gtvt.haitv.ecommerce.common.exception.ApiException;
import gtvt.haitv.ecommerce.common.log.FlowLog;
import gtvt.haitv.ecommerce.product.domain.Category;
import gtvt.haitv.ecommerce.product.domain.Product;
import gtvt.haitv.ecommerce.product.dto.CategoryRequest;
import gtvt.haitv.ecommerce.product.dto.CategoryResponse;
import gtvt.haitv.ecommerce.product.dto.PageResponse;
import gtvt.haitv.ecommerce.product.dto.ProductRequest;
import gtvt.haitv.ecommerce.product.dto.ProductResponse;
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

@Service
public class ProductCatalogService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductCatalogService(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> listCategories() {
        FlowLog f = FlowLog.start("listCategories");
        var list = categoryRepository.findAll().stream().map(CategoryResponse::from).toList();
        f.end("n=" + list.size());
        return list;
    }

    @Transactional(readOnly = true)
    public CategoryResponse getCategory(Long id) {
        FlowLog f = FlowLog.start("getCategory");
        try {
            CategoryResponse r = CategoryResponse.from(category(id));
            f.end("id=" + id);
            return r;
        } catch (RuntimeException e) {
            f.fail(e);
            throw e;
        }
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        FlowLog f = FlowLog.start("createCategory");
        try {
            if (categoryRepository.existsByNameIgnoreCase(request.getName())) {
                throw new ApiException(HttpStatus.CONFLICT, "CATEGORY_EXISTS", "Category already exists");
            }
            Category c = new Category();
            c.setName(request.getName());
            c.setDescription(request.getDescription());
            CategoryResponse r = CategoryResponse.from(categoryRepository.save(c));
            f.end("id=" + r.getId());
            return r;
        } catch (RuntimeException e) {
            f.fail(e);
            throw e;
        }
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        FlowLog f = FlowLog.start("updateCategory");
        try {
            Category c = category(id);
            c.setName(request.getName());
            c.setDescription(request.getDescription());
            f.end("id=" + id);
            return CategoryResponse.from(c);
        } catch (RuntimeException e) {
            f.fail(e);
            throw e;
        }
    }

    @Transactional
    public void deleteCategory(Long id) {
        FlowLog f = FlowLog.start("deleteCategory");
        try {
            categoryRepository.delete(category(id));
            f.end("id=" + id);
        } catch (RuntimeException e) {
            f.fail(e);
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> search(String keyword, Long categoryId, String brand,
                                                BigDecimal minPrice, BigDecimal maxPrice, String status,
                                                int page, int size) {
        FlowLog f = FlowLog.start("searchProducts");
        Specification<Product> spec = (root, q, cb) -> cb.conjunction();
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
        FlowLog f = FlowLog.start("getProduct");
        try {
            ProductResponse r = ProductResponse.from(product(id));
            f.end("id=" + id);
            return r;
        } catch (RuntimeException e) {
            f.fail(e);
            throw e;
        }
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        FlowLog f = FlowLog.start("createProduct");
        try {
            category(request.getCategoryId());
            Product p = new Product();
            apply(p, request);
            ProductResponse r = ProductResponse.from(productRepository.save(p));
            f.end("id=" + r.getId());
            return r;
        } catch (RuntimeException e) {
            f.fail(e);
            throw e;
        }
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        FlowLog f = FlowLog.start("updateProduct");
        try {
            Product p = product(id);
            category(request.getCategoryId());
            apply(p, request);
            f.end("id=" + id);
            return ProductResponse.from(p);
        } catch (RuntimeException e) {
            f.fail(e);
            throw e;
        }
    }

    @Transactional
    public void deleteProduct(Long id) {
        FlowLog f = FlowLog.start("deleteProduct");
        try {
            productRepository.delete(product(id));
            f.end("id=" + id);
        } catch (RuntimeException e) {
            f.fail(e);
            throw e;
        }
    }

    private void apply(Product p, ProductRequest request) {
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
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "CATEGORY_NOT_FOUND", "Category not found"));
    }

    private Product product(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "PRODUCT_NOT_FOUND", "Product not found"));
    }
}
