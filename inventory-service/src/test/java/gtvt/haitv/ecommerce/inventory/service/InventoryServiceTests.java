package gtvt.haitv.ecommerce.inventory.service;

import gtvt.haitv.ecommerce.common.exception.ApiException;
import gtvt.haitv.ecommerce.inventory.domain.Inventory;
import gtvt.haitv.ecommerce.inventory.dto.StockItemsRequest;
import gtvt.haitv.ecommerce.inventory.repository.InventoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("test")
class InventoryServiceTests {

    @Autowired InventoryService inventoryService;
    @Autowired InventoryRepository repository;

    @BeforeEach
    void seed() {
        repository.deleteAll();
        Inventory inv = new Inventory();
        inv.setProductId(1L);
        inv.setAvailableQuantity(10);
        inv.setReservedQuantity(0);
        repository.save(inv);
    }

    private StockItemsRequest req(int qty) {
        StockItemsRequest r = new StockItemsRequest();
        StockItemsRequest.Item item = new StockItemsRequest.Item();
        item.setProductId(1L);
        item.setQuantity(qty);
        r.setItems(List.of(item));
        return r;
    }

    @Test
    void enoughStock() {
        assertTrue(inventoryService.check(req(5)).isAvailable());
    }

    @Test
    void notEnoughStock() {
        assertFalse(inventoryService.check(req(11)).isAvailable());
    }

    @Test
    void reserveAndRelease() {
        inventoryService.reserve(req(4));
        Inventory after = repository.findByProductId(1L).orElseThrow();
        assertEquals(6, after.getAvailableQuantity());
        assertEquals(4, after.getReservedQuantity());
        inventoryService.release(req(4));
        Inventory released = repository.findByProductId(1L).orElseThrow();
        assertEquals(10, released.getAvailableQuantity());
        assertEquals(0, released.getReservedQuantity());
    }

    @Test
    void reserveFailsWhenOutOfStock() {
        assertThrows(ApiException.class, () -> inventoryService.reserve(req(99)));
    }
}
