package gtvt.haitv.ecommerce.inventory.service;

import gtvt.haitv.ecommerce.common.constant.ErrorConstant;
import gtvt.haitv.ecommerce.common.constant.MessageConstant;
import gtvt.haitv.ecommerce.common.exception.ApiException;
import gtvt.haitv.ecommerce.common.security.SecurityUtils;
import gtvt.haitv.ecommerce.inventory.client.ProductClient;
import gtvt.haitv.ecommerce.inventory.client.ShopClient;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class InventoryAccessService {

    private final ProductClient productClient;
    private final ShopClient shopClient;

    public InventoryAccessService(ProductClient productClient, ShopClient shopClient) {
        this.productClient = productClient;
        this.shopClient = shopClient;
    }

    public void requireCanUpdateProduct(Long productId) {
        if (SecurityUtils.isAdmin()) {
            return;
        }
        ProductClient.RemoteProduct product = productClient.get(productId).getData();
        if (product == null || product.getShopId() == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, ErrorConstant.PRODUCT_NOT_FOUND, MessageConstant.PRODUCT_NOT_FOUND);
        }
        Long userId = SecurityUtils.currentUserId();
        Map<String, Boolean> member = shopClient.member(product.getShopId(), userId).getData();
        if (member == null || !Boolean.TRUE.equals(member.get("member"))) {
            throw new ApiException(HttpStatus.FORBIDDEN, ErrorConstant.FORBIDDEN, MessageConstant.FORBIDDEN);
        }
    }
}
