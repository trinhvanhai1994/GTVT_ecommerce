package gtvt.haitv.ecommerce.product.controller;

import gtvt.haitv.ecommerce.common.api.ApiResponse;
import gtvt.haitv.ecommerce.product.dto.CategoryRequest;
import gtvt.haitv.ecommerce.product.dto.CategoryResponse;
import gtvt.haitv.ecommerce.product.dto.PageResponse;
import gtvt.haitv.ecommerce.product.dto.ProductRequest;
import gtvt.haitv.ecommerce.product.dto.ProductResponse;
import gtvt.haitv.ecommerce.product.service.ProductCatalogService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductCatalogService service;

    public ProductController(ProductCatalogService service) {
        this.service = service;
    }

    @GetMapping
    public ApiResponse<PageResponse<ProductResponse>> search(
            @RequestParam(required = false, name = "keyword") String keyword,
            @RequestParam(required = false, name = "categoryId") Long categoryId,
            @RequestParam(required = false, name = "brand") String brand,
            @RequestParam(required = false, name = "minPrice") BigDecimal minPrice,
            @RequestParam(required = false, name = "maxPrice") BigDecimal maxPrice,
            @RequestParam(required = false, name = "status") String status,
            @RequestParam(defaultValue = "0", name = "page") int page,
            @RequestParam(defaultValue = "10", name = "size") int size) {
        return ApiResponse.ok(service.search(keyword, categoryId, brand, minPrice, maxPrice, status, page, size));
    }

    @GetMapping("/{id}")
    public ApiResponse<ProductResponse> get(@PathVariable("id") Long id) {
        return ApiResponse.ok(service.getProduct(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ProductResponse> create(@Valid @RequestBody ProductRequest request) {
        return ApiResponse.ok("Created", service.createProduct(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<ProductResponse> update(@PathVariable("id") Long id, @Valid @RequestBody ProductRequest request) {
        return ApiResponse.ok(service.updateProduct(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable("id") Long id) {
        service.deleteProduct(id);
        return ApiResponse.ok("Deleted", null);
    }

    @GetMapping("/categories")
    public ApiResponse<List<CategoryResponse>> categories() {
        return ApiResponse.ok(service.listCategories());
    }

    @GetMapping("/categories/{id}")
    public ApiResponse<CategoryResponse> category(@PathVariable("id") Long id) {
        return ApiResponse.ok(service.getCategory(id));
    }

    @PostMapping("/categories")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<CategoryResponse> createCategory(@Valid @RequestBody CategoryRequest request) {
        return ApiResponse.ok("Created", service.createCategory(request));
    }

    @PutMapping("/categories/{id}")
    public ApiResponse<CategoryResponse> updateCategory(@PathVariable("id") Long id, @Valid @RequestBody CategoryRequest request) {
        return ApiResponse.ok(service.updateCategory(id, request));
    }

    @DeleteMapping("/categories/{id}")
    public ApiResponse<Void> deleteCategory(@PathVariable("id") Long id) {
        service.deleteCategory(id);
        return ApiResponse.ok("Deleted", null);
    }
}
