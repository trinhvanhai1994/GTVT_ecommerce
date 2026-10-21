package gtvt.haitv.ecommerce.product.config;

import gtvt.haitv.ecommerce.product.entity.Category;
import gtvt.haitv.ecommerce.product.entity.Product;
import gtvt.haitv.ecommerce.product.repository.CategoryRepository;
import gtvt.haitv.ecommerce.product.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Catalog mẫu khớp 10 shop seed (shopId 1..10).
 * Mỗi lần start (profile !test) sẽ reset catalog để luôn đúng theme shop.
 */
@Configuration
@Profile("!test")
public class ProductDataSeeder {

    @Bean
    CommandLineRunner seedCatalog(CategoryRepository categories, ProductRepository products, JdbcTemplate jdbc) {
        return args -> {
            // Reset catalog so themed products always match shops after redeploy
            jdbc.execute("TRUNCATE TABLE products RESTART IDENTITY CASCADE");
            jdbc.execute("TRUNCATE TABLE categories RESTART IDENTITY CASCADE");

            seedShop(categories, products, 1L, Map.of(
                    "Điện thoại", List.of(
                            p("Samsung Galaxy S24", "Flagship Android 6.2\" Dynamic AMOLED, camera 50MP", "22990000", "Samsung",
                                    "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=600&q=80"),
                            p("iPhone 15", "Chip A16, camera 48MP, USB-C", "24990000", "Apple",
                                    "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80"),
                            p("Xiaomi 14", "Snapdragon 8 Gen 3, sạc nhanh 90W", "16990000", "Xiaomi",
                                    "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80")
                    ),
                    "Laptop", List.of(
                            p("MacBook Air M3", "13\" Retina, pin cả ngày, nhẹ 1.24kg", "28990000", "Apple",
                                    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80"),
                            p("Dell XPS 13", "Ultrabook Intel Core Ultra, màn InfinityEdge", "32990000", "Dell",
                                    "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80")
                    )
            ));

            seedShop(categories, products, 2L, Map.of(
                    "Tai nghe", List.of(
                            p("Sony WH-1000XM5", "Chống ồn chủ động, pin 30 giờ", "8490000", "Sony",
                                    "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=600&q=80"),
                            p("AirPods Pro 2", "ANC, Spatial Audio, MagSafe case", "5990000", "Apple",
                                    "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80"),
                            p("JBL Tune 760NC", "Over-ear Bluetooth, bass mạnh", "1890000", "JBL",
                                    "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80")
                    ),
                    "Loa & phụ kiện", List.of(
                            p("Marshall Emberton II", "Loa Bluetooth di động, chống nước IP67", "3990000", "Marshall",
                                    "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=80"),
                            p("Audio-Technica AT2020", "Microphone condenser studio", "2490000", "Audio-Technica",
                                    "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=600&q=80")
                    )
            ));

            seedShop(categories, products, 3L, Map.of(
                    "Smart home", List.of(
                            p("TP-Link Tapo P110", "Ổ cắm thông minh đo điện năng", "349000", "TP-Link",
                                    "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80"),
                            p("Philips Hue Starter", "Bộ đèn LED thông minh + bridge", "2490000", "Philips",
                                    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80")
                    ),
                    "Phụ kiện máy tính", List.of(
                            p("Logitech C920 HD Pro", "Webcam Full HD 1080p cho họp online", "1890000", "Logitech",
                                    "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=600&q=80"),
                            p("Anker PowerCore 20000", "Pin dự phòng 20.000mAh sạc nhanh", "990000", "Anker",
                                    "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=600&q=80"),
                            p("Samsung T7 SSD 1TB", "Ổ cứng di động USB 3.2 tốc độ cao", "2790000", "Samsung",
                                    "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=600&q=80")
                    )
            ));

            seedShop(categories, products, 4L, Map.of(
                    "Sách kỹ thuật", List.of(
                            p("Clean Code", "Robert C. Martin — viết code sạch, dễ bảo trì", "350000", "Prentice Hall",
                                    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80"),
                            p("Domain-Driven Design", "Eric Evans — thiết kế domain phức tạp", "480000", "Addison-Wesley",
                                    "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80"),
                            p("Designing Data-Intensive Apps", "Martin Kleppmann — hệ thống dữ liệu quy mô lớn", "520000", "O'Reilly",
                                    "https://images.unsplash.com/photo-1495446815901-a7297e958b1d?auto=format&fit=crop&w=600&q=80")
                    ),
                    "Văn phòng phẩm", List.of(
                            p("Moleskine Classic Notebook", "Sổ tay A5 bìa cứng, giấy ivory", "450000", "Moleskine",
                                    "https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=600&q=80"),
                            p("Pilot G2 Gel Pen Set", "Bộ 5 bút gel 0.7mm mực đen", "120000", "Pilot",
                                    "https://images.unsplash.com/photo-1583485088034-697b5bc36ecd?auto=format&fit=crop&w=600&q=80")
                    )
            ));

            seedShop(categories, products, 5L, Map.of(
                    "Áo", List.of(
                            p("Uniqlo AIRism Tee", "Áo thun nam nữ thoáng mát, nhiều màu", "299000", "Uniqlo",
                                    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80"),
                            p("Levi's Trucker Jacket", "Áo khoác denim cổ điển", "2490000", "Levi's",
                                    "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80")
                    ),
                    "Quần & phụ kiện", List.of(
                            p("Nike Sportswear Club Fleece", "Quần jogger nỉ basic", "1290000", "Nike",
                                    "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=600&q=80"),
                            p("Adidas Stan Smith", "Giày sneaker trắng cổ bền", "2290000", "Adidas",
                                    "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80"),
                            p("Herschel Little America", "Balo laptop 25L chống nước nhẹ", "2890000", "Herschel",
                                    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80")
                    )
            ));

            seedShop(categories, products, 6L, Map.of(
                    "Đèn & trang trí", List.of(
                            p("IKEA TERJE Desk Lamp", "Đèn bàn LED chỉnh góc, ánh sáng ấm", "499000", "IKEA",
                                    "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80"),
                            p("Muji Aroma Diffuser", "Máy khuếch tán tinh dầu siêu âm", "990000", "Muji",
                                    "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80")
                    ),
                    "Lưu trữ & gia dụng", List.of(
                            p("Muji PP Storage Box", "Hộp đựng trong suốt xếp chồng được", "199000", "Muji",
                                    "https://images.unsplash.com/photo-1595428774223-ef52624120d5?auto=format&fit=crop&w=600&q=80"),
                            p("Joseph Joseph Nest Bowls", "Bộ tô nhà bếp xếp lồng nhau", "890000", "Joseph Joseph",
                                    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=600&q=80"),
                            p("Dyson V8 Absolute", "Máy hút bụi không dây đa đầu hút", "12990000", "Dyson",
                                    "https://images.unsplash.com/photo-1558317374-5297b3c4b1c0?auto=format&fit=crop&w=600&q=80")
                    )
            ));

            seedShop(categories, products, 7L, Map.of(
                    "Yoga & fitness", List.of(
                            p("Decathlon Manduka Lite Mat", "Thảm yoga chống trượt 5mm", "499000", "Decathlon",
                                    "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=600&q=80"),
                            p("Nike Pro Training Cap", "Mũ chạy bộ thấm hút mồ hôi", "450000", "Nike",
                                    "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=600&q=80")
                    ),
                    "Outdoor", List.of(
                            p("The North Face Borealis", "Balo hiking 28L nhiều ngăn", "2490000", "The North Face",
                                    "https://images.unsplash.com/photo-1622260614158-6b716b7b4d8b?auto=format&fit=crop&w=600&q=80"),
                            p("Columbia Rain Jacket", "Áo mưa nhẹ packable chống nước", "1890000", "Columbia",
                                    "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?auto=format&fit=crop&w=600&q=80"),
                            p("Garmin Forerunner 255", "Đồng hồ GPS chạy bộ HR wrist", "8990000", "Garmin",
                                    "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=600&q=80")
                    )
            ));

            seedShop(categories, products, 8L, Map.of(
                    "Đồ chơi xây dựng", List.of(
                            p("LEGO Classic Creative Box", "Hộp gạch sáng tạo 790 mảnh", "1290000", "LEGO",
                                    "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=600&q=80"),
                            p("LEGO Duplo My First", "Bộ xếp hình cho bé 1.5–3 tuổi", "790000", "LEGO",
                                    "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=600&q=80")
                    ),
                    "Puzzle & học tập", List.of(
                            p("Ravensburger Animal Puzzle 500", "Xếp hình động vật 500 mảnh", "350000", "Ravensburger",
                                    "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?auto=format&fit=crop&w=600&q=80"),
                            p("Crayola Inspiration Art Case", "Bộ màu vẽ và sổ sketch cho trẻ", "450000", "Crayola",
                                    "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=80"),
                            p("Melissa & Doug Wooden Kitchen", "Bếp đồ chơi gỗ an toàn", "1890000", "Melissa & Doug",
                                    "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=600&q=80")
                    )
            ));

            seedShop(categories, products, 9L, Map.of(
                    "Chăm sóc da", List.of(
                            p("Innisfree Green Tea Seed Cream", "Kem dưỡng ẩm trà xanh Jeju 50ml", "450000", "Innisfree",
                                    "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=600&q=80"),
                            p("Laneige Water Sleeping Mask", "Mặt nạ ngủ cấp nước overnight", "520000", "Laneige",
                                    "https://images.unsplash.com/photo-1570194065650-d99fb4b38b17?auto=format&fit=crop&w=600&q=80"),
                            p("CeraVe Foaming Cleanser", "Sữa rửa mặt ceramide cho da dầu", "320000", "CeraVe",
                                    "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80")
                    ),
                    "Trang điểm", List.of(
                            p("Laneige Lip Sleeping Mask", "Mặt nạ môi hương berry 20g", "390000", "Laneige",
                                    "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80"),
                            p("Maybelline Fit Me Foundation", "Kem nền matte poreless 30ml", "250000", "Maybelline",
                                    "https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?auto=format&fit=crop&w=600&q=80")
                    )
            ));

            seedShop(categories, products, 10L, Map.of(
                    "Thức ăn thú cưng", List.of(
                            p("Pedigree Adult Dog Food 2kg", "Thức ăn khô cho chó trưởng thành", "280000", "Pedigree",
                                    "https://images.unsplash.com/photo-1589924691995-400dc9dac711?auto=format&fit=crop&w=600&q=80"),
                            p("Whiskas Adult Cat Food 1.2kg", "Hạt cho mèo trưởng thành vị cá", "190000", "Whiskas",
                                    "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=600&q=80"),
                            p("Royal Canin Mini Adult 2kg", "Thức ăn dinh dưỡng cho chó nhỏ", "520000", "Royal Canin",
                                    "https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=600&q=80")
                    ),
                    "Phụ kiện & đồ chơi", List.of(
                            p("Kong Classic Dog Toy", "Đồ chơi cao su nhồi treat cho chó", "320000", "Kong",
                                    "https://images.unsplash.com/photo-1535295972055-1c762f4483cb?auto=format&fit=crop&w=600&q=80"),
                            p("Catnip Feather Wand", "Cần câu lông vũ có catnip", "99000", "PetSafe",
                                    "https://images.unsplash.com/photo-1545249390-6bdfa286032f?auto=format&fit=crop&w=600&q=80")
                    )
            ));
        };
    }

    private void seedShop(CategoryRepository categories, ProductRepository products, Long shopId,
                          Map<String, List<ProdSpec>> byCategory) {
        Map<String, List<ProdSpec>> ordered = new LinkedHashMap<>(byCategory);
        for (Map.Entry<String, List<ProdSpec>> e : ordered.entrySet()) {
            Category cat = cat(categories, shopId, e.getKey(), e.getKey() + " — cửa hàng #" + shopId);
            for (ProdSpec spec : e.getValue()) {
                products.save(prod(shopId, cat.getId(), spec));
            }
        }
    }

    private Category cat(CategoryRepository repo, Long shopId, String name, String desc) {
        Category c = new Category();
        c.setShopId(shopId);
        c.setName(name);
        c.setDescription(desc);
        return repo.save(c);
    }

    private Product prod(Long shopId, Long categoryId, ProdSpec spec) {
        Product p = new Product();
        p.setShopId(shopId);
        p.setCategoryId(categoryId);
        p.setName(spec.name);
        p.setDescription(spec.description);
        p.setPrice(new BigDecimal(spec.price));
        p.setBrand(spec.brand);
        p.setImageUrl(spec.imageUrl);
        p.setStatus("ACTIVE");
        return p;
    }

    private static ProdSpec p(String name, String description, String price, String brand, String imageUrl) {
        return new ProdSpec(name, description, price, brand, imageUrl);
    }

    private record ProdSpec(String name, String description, String price, String brand, String imageUrl) {}
}
