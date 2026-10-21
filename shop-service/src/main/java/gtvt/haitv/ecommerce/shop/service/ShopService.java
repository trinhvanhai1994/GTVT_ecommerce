package gtvt.haitv.ecommerce.shop.service;

import gtvt.haitv.ecommerce.common.constant.AppConstant;
import gtvt.haitv.ecommerce.common.constant.ErrorConstant;
import gtvt.haitv.ecommerce.common.constant.MessageConstant;
import gtvt.haitv.ecommerce.common.exception.ApiException;
import gtvt.haitv.ecommerce.shop.client.AuthClient;
import gtvt.haitv.ecommerce.shop.dto.RejectShopRequest;
import gtvt.haitv.ecommerce.shop.dto.ShopRequest;
import gtvt.haitv.ecommerce.shop.dto.ShopResponse;
import gtvt.haitv.ecommerce.shop.entity.Shop;
import gtvt.haitv.ecommerce.shop.entity.ShopMember;
import gtvt.haitv.ecommerce.shop.repository.ShopMemberRepository;
import gtvt.haitv.ecommerce.shop.repository.ShopRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class ShopService {

    private static final Logger log = LoggerFactory.getLogger(ShopService.class);

    private final ShopRepository shopRepository;
    private final ShopMemberRepository memberRepository;
    private final AuthClient authClient;

    public ShopService(ShopRepository shopRepository, ShopMemberRepository memberRepository, AuthClient authClient) {
        this.shopRepository = shopRepository;
        this.memberRepository = memberRepository;
        this.authClient = authClient;
    }

    @Transactional(readOnly = true)
    public List<ShopResponse> listPublic(String status, String q) {
        String st = StringUtils.hasText(status) ? status : AppConstant.SHOP_APPROVED;
        Specification<Shop> spec = (root, query, cb) -> cb.equal(root.get("status"), st);
        if (StringUtils.hasText(q)) {
            String like = "%" + q.toLowerCase(Locale.ROOT) + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("name")), like),
                    cb.like(cb.lower(root.get("slug")), like)));
        }
        return shopRepository.findAll(spec).stream().map(ShopResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public ShopResponse getBySlug(String slug) {
        Shop shop = shopRepository.findBySlugIgnoreCase(slug)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, ErrorConstant.SHOP_NOT_FOUND, MessageConstant.SHOP_NOT_FOUND));
        if (!AppConstant.SHOP_APPROVED.equals(shop.getStatus())) {
            throw new ApiException(HttpStatus.NOT_FOUND, ErrorConstant.SHOP_NOT_FOUND, MessageConstant.SHOP_NOT_FOUND);
        }
        return ShopResponse.from(shop);
    }

    @Transactional(readOnly = true)
    public ShopResponse getById(Long id) {
        return ShopResponse.from(shop(id));
    }

    @Transactional(readOnly = true)
    public boolean isMember(Long shopId, Long userId) {
        return memberRepository.existsByShopIdAndUserIdAndStatus(shopId, userId, AppConstant.SHOP_MEMBER_ACTIVE);
    }

    @Transactional(readOnly = true)
    public boolean isApproved(Long shopId) {
        return shopRepository.findById(shopId)
                .map(s -> AppConstant.SHOP_APPROVED.equals(s.getStatus()))
                .orElse(false);
    }

    @Transactional
    public ShopResponse register(Long userId, ShopRequest request) {
        if (shopRepository.existsByOwnerUserIdAndStatusIn(userId,
                List.of(AppConstant.SHOP_PENDING, AppConstant.SHOP_APPROVED))) {
            throw new ApiException(HttpStatus.CONFLICT, ErrorConstant.VALIDATION_ERROR,
                    "You already have a pending or approved shop");
        }
        String slug = request.getSlug().trim().toLowerCase(Locale.ROOT);
        if (shopRepository.existsBySlugIgnoreCase(slug)) {
            throw new ApiException(HttpStatus.CONFLICT, ErrorConstant.VALIDATION_ERROR, "Slug already taken");
        }
        Shop shop = new Shop();
        shop.setOwnerUserId(userId);
        shop.setSlug(slug);
        shop.setName(request.getName().trim());
        shop.setDescription(request.getDescription());
        shop.setLogoUrl(request.getLogoUrl());
        shop.setContactEmail(request.getContactEmail().trim().toLowerCase());
        shop.setStatus(AppConstant.SHOP_PENDING);
        shop = shopRepository.save(shop);

        ShopMember member = new ShopMember();
        member.setShopId(shop.getId());
        member.setUserId(userId);
        member.setRoleInShop(AppConstant.SHOP_MEMBER_OWNER);
        member.setStatus(AppConstant.SHOP_MEMBER_ACTIVE);
        memberRepository.save(member);

        try {
            authClient.setRole(userId, Map.of("role", AppConstant.ROLE_SELLER));
        } catch (Exception ex) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, ErrorConstant.VALIDATION_ERROR,
                    "Shop created but failed to set SELLER role: " + ex.getMessage());
        }
        return ShopResponse.from(shop);
    }

    @Transactional(readOnly = true)
    public ShopResponse myShop(Long userId) {
        return shopRepository.findByOwnerUserId(userId).stream()
                .findFirst()
                .map(ShopResponse::from)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, ErrorConstant.SHOP_NOT_FOUND, MessageConstant.SHOP_NOT_FOUND));
    }

    @Transactional
    public ShopResponse updateMyShop(Long userId, ShopRequest request) {
        Shop shop = shopRepository.findByOwnerUserId(userId).stream()
                .filter(s -> AppConstant.SHOP_APPROVED.equals(s.getStatus()))
                .findFirst()
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, ErrorConstant.SHOP_NOT_FOUND, MessageConstant.SHOP_NOT_FOUND));
        shop.setName(request.getName().trim());
        shop.setDescription(request.getDescription());
        shop.setLogoUrl(request.getLogoUrl());
        return ShopResponse.from(shop);
    }

    @Transactional
    public ShopResponse approve(Long id) {
        Shop shop = shop(id);
        shop.setStatus(AppConstant.SHOP_APPROVED);
        shop.setRejectReason(null);
        try {
            String mailTo = shop.getContactEmail();
            if (mailTo == null || mailTo.isBlank()) {
                var owner = authClient.byId(shop.getOwnerUserId());
                mailTo = owner.getData() != null ? owner.getData().getEmail() : null;
            }
            if (mailTo == null || mailTo.isBlank()) {
                throw new ApiException(HttpStatus.BAD_REQUEST, ErrorConstant.VALIDATION_ERROR, "Missing contact email");
            }
            authClient.shopApproved(
                    shop.getOwnerUserId(),
                    new gtvt.haitv.ecommerce.shop.dto.ShopApprovedProvisionPayload(
                            mailTo,
                            shop.getName(),
                            shop.getId(),
                            shop.getSlug()));
        } catch (Exception ex) {
            log.error("Shop {} approved but credential email failed: {}", id, ex.getMessage());
        }
        return ShopResponse.from(shop);
    }

    @Transactional
    public ShopResponse reject(Long id, RejectShopRequest request) {
        Shop shop = shop(id);
        shop.setStatus(AppConstant.SHOP_REJECTED);
        shop.setRejectReason(request.getReason());
        return ShopResponse.from(shop);
    }

    @Transactional
    public ShopResponse suspend(Long id) {
        Shop shop = shop(id);
        shop.setStatus(AppConstant.SHOP_SUSPENDED);
        return ShopResponse.from(shop);
    }

    @Transactional(readOnly = true)
    public List<ShopResponse> listAllForAdmin() {
        return shopRepository.findAll().stream().map(ShopResponse::from).toList();
    }

    private Shop shop(Long id) {
        return shopRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, ErrorConstant.SHOP_NOT_FOUND, MessageConstant.SHOP_NOT_FOUND));
    }
}
