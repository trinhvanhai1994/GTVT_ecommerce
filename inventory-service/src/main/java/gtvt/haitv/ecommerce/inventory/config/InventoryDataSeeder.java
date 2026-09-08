package gtvt.haitv.ecommerce.inventory.config;

import gtvt.haitv.ecommerce.inventory.domain.Inventory;
import gtvt.haitv.ecommerce.inventory.repository.InventoryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile("!test")
public class InventoryDataSeeder {
    @Bean
    CommandLineRunner seedInventory(InventoryRepository repository) {
        return args -> {
            if (repository.count() > 0) {
                return;
            }
            for (long productId = 1; productId <= 11; productId++) {
                Inventory inv = new Inventory();
                inv.setProductId(productId);
                inv.setAvailableQuantity(50);
                inv.setReservedQuantity(0);
                repository.save(inv);
            }
        };
    }
}
