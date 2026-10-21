package gtvt.haitv.ecommerce.shop.config;

import gtvt.haitv.ecommerce.common.api.ApiResponse;
import gtvt.haitv.ecommerce.common.constant.AppConstant;
import gtvt.haitv.ecommerce.shop.client.AuthClient;
import gtvt.haitv.ecommerce.shop.entity.Shop;
import gtvt.haitv.ecommerce.shop.entity.ShopMember;
import gtvt.haitv.ecommerce.shop.repository.ShopMemberRepository;
import gtvt.haitv.ecommerce.shop.repository.ShopRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile("!test")
public class ShopDataSeeder {

    private static final Logger log = LoggerFactory.getLogger(ShopDataSeeder.class);

    private static final String[][] SHOPS = {
            {"tech-haven", "Tech Haven", "Điện thoại và laptop chính hãng"},
            {"audio-lab", "Audio Lab", "Tai nghe và phụ kiện âm thanh"},
            {"gadget-world", "Gadget World", "Đồ chơi công nghệ và smart home"},
            {"book-nook", "Book Nook", "Sách và văn phòng phẩm"},
            {"fashion-hub", "Fashion Hub", "Thời trang nam nữ basic"},
            {"home-living", "Home Living", "Đồ gia dụng và nội thất nhỏ"},
            {"sporty", "Sporty Zone", "Thể thao và outdoor"},
            {"kids-corner", "Kids Corner", "Đồ chơi và phụ kiện trẻ em"},
            {"beauty-bar", "Beauty Bar", "Mỹ phẩm và chăm sóc cá nhân"},
            {"pet-palace", "Pet Palace", "Thức ăn và phụ kiện thú cưng"}
    };

    private static final String[] LOGOS = {
            "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=80",
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80",
            "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80",
            "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80",
            "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=400&q=80",
            "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=400&q=80",
            "https://images.unsplash.com/photo-1517649763962-0c623066027b?auto=format&fit=crop&w=400&q=80",
            "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=400&q=80",
            "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=400&q=80",
            "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=400&q=80"
    };

    @Bean
    CommandLineRunner seedShops(ShopRepository shops, ShopMemberRepository members, AuthClient authClient) {
        return args -> {
            for (int attempt = 1; attempt <= 30; attempt++) {
                try {
                    seedOnce(shops, members, authClient);
                    return;
                } catch (Exception e) {
                    log.warn("Shop seed attempt {}/30 failed: {}", attempt, e.getMessage());
                    Thread.sleep(2000L);
                }
            }
            log.error("Shop seed gave up after retries — create shops manually if Home is empty");
        };
    }

    private void seedOnce(ShopRepository shops, ShopMemberRepository members, AuthClient authClient) {
        for (int i = 0; i < SHOPS.length; i++) {
            String slug = SHOPS[i][0];
            if (shops.existsBySlugIgnoreCase(slug)) {
                continue;
            }
            String email = "seller" + (i + 1) + "@example.com";
            ApiResponse<AuthClient.RemoteUser> res = authClient.byEmail(email);
            if (res == null || res.getData() == null || res.getData().getId() == null) {
                throw new IllegalStateException("Auth user missing for " + email);
            }
            long ownerId = res.getData().getId();
            Shop shop = shop(shops, ownerId, slug, SHOPS[i][1], SHOPS[i][2], LOGOS[i], email);
            member(members, shop.getId(), ownerId);
            log.info("Seeded shop {} (id={}) owner={}", slug, shop.getId(), email);
        }
    }

    private Shop shop(ShopRepository repo, Long ownerId, String slug, String name, String desc, String logo, String email) {
        Shop s = new Shop();
        s.setOwnerUserId(ownerId);
        s.setSlug(slug);
        s.setName(name);
        s.setDescription(desc);
        s.setLogoUrl(logo);
        s.setContactEmail(email);
        s.setStatus(AppConstant.SHOP_APPROVED);
        return repo.save(s);
    }

    private void member(ShopMemberRepository repo, Long shopId, Long userId) {
        if (repo.existsByShopIdAndUserIdAndStatus(shopId, userId, AppConstant.SHOP_MEMBER_ACTIVE)) {
            return;
        }
        ShopMember m = new ShopMember();
        m.setShopId(shopId);
        m.setUserId(userId);
        m.setRoleInShop(AppConstant.SHOP_MEMBER_OWNER);
        m.setStatus(AppConstant.SHOP_MEMBER_ACTIVE);
        repo.save(m);
    }
}
