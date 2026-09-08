package gtvt.haitv.ecommerce.product.config;

import gtvt.haitv.ecommerce.product.domain.Category;
import gtvt.haitv.ecommerce.product.domain.Product;
import gtvt.haitv.ecommerce.product.repository.CategoryRepository;
import gtvt.haitv.ecommerce.product.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.math.BigDecimal;
import java.util.List;

@Configuration
@Profile("!test")
public class ProductDataSeeder {

    @Bean
    CommandLineRunner seedCatalog(CategoryRepository categories, ProductRepository products) {
        return args -> {
            if (categories.count() > 0) {
                return;
            }
            Category phone = cat(categories, "Smartphone", "Mobile phones");
            Category laptop = cat(categories, "Laptop", "Notebooks");
            Category headphone = cat(categories, "Headphone", "Audio");
            Category accessories = cat(categories, "Accessories", "Cables and cases");
            List.of(
                    prod("Galaxy S24", "Flagship phone", "999.00", phone.getId(), "Samsung"),
                    prod("iPhone 15", "Apple phone", "1099.00", phone.getId(), "Apple"),
                    prod("Pixel 9", "Google phone", "899.00", phone.getId(), "Google"),
                    prod("ThinkPad X1", "Business laptop", "1499.00", laptop.getId(), "Lenovo"),
                    prod("MacBook Air", "Thin laptop", "1299.00", laptop.getId(), "Apple"),
                    prod("Zenbook 14", "Ultrabook", "1199.00", laptop.getId(), "Asus"),
                    prod("WH-1000XM5", "Noise cancelling", "349.00", headphone.getId(), "Sony"),
                    prod("AirPods Pro", "TWS earbuds", "249.00", headphone.getId(), "Apple"),
                    prod("USB-C Hub", "Multiport hub", "49.00", accessories.getId(), "Anker"),
                    prod("Phone Case", "Protective case", "19.00", accessories.getId(), "Spigen"),
                    prod("Laptop Sleeve", "13 inch sleeve", "29.00", accessories.getId(), "Tomtoc")
            ).forEach(products::save);
        };
    }

    private Category cat(CategoryRepository repo, String name, String desc) {
        Category c = new Category();
        c.setName(name);
        c.setDescription(desc);
        return repo.save(c);
    }

    private Product prod(String name, String desc, String price, Long categoryId, String brand) {
        Product p = new Product();
        p.setName(name);
        p.setDescription(desc);
        p.setPrice(new BigDecimal(price));
        p.setCategoryId(categoryId);
        p.setBrand(brand);
        p.setStatus("ACTIVE");
        return p;
    }
}
