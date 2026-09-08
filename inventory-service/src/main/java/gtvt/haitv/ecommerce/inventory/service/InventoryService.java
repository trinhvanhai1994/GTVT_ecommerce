package gtvt.haitv.ecommerce.inventory.service;

import gtvt.haitv.ecommerce.common.exception.ApiException;
import gtvt.haitv.ecommerce.common.log.FlowLog;
import gtvt.haitv.ecommerce.inventory.domain.Inventory;
import gtvt.haitv.ecommerce.inventory.dto.InventoryResponse;
import gtvt.haitv.ecommerce.inventory.dto.StockCheckResponse;
import gtvt.haitv.ecommerce.inventory.dto.StockItemsRequest;
import gtvt.haitv.ecommerce.inventory.repository.InventoryRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class InventoryService {

    private final InventoryRepository repository;

    public InventoryService(InventoryRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<InventoryResponse> list() {
        FlowLog f = FlowLog.start("listInventory");
        var list = repository.findAll().stream().map(InventoryResponse::from).toList();
        f.end("n=" + list.size());
        return list;
    }

    @Transactional(readOnly = true)
    public InventoryResponse getByProduct(Long productId) {
        FlowLog f = FlowLog.start("getInventory");
        try {
            InventoryResponse r = InventoryResponse.from(unlocked(productId));
            f.end("productId=" + productId);
            return r;
        } catch (RuntimeException e) {
            f.fail(e);
            throw e;
        }
    }

    @Transactional
    public InventoryResponse updateAvailable(Long productId, int available) {
        FlowLog f = FlowLog.start("updateStock");
        try {
            Inventory inv = repository.findWithLockByProductId(productId).orElseGet(() -> create(productId));
            if (available < 0) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_STOCK", "availableQuantity cannot be negative");
            }
            inv.setAvailableQuantity(available);
            f.end("productId=" + productId + " avail=" + available);
            return InventoryResponse.from(inv);
        } catch (RuntimeException e) {
            f.fail(e);
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public StockCheckResponse check(StockItemsRequest request) {
        FlowLog f = FlowLog.start("checkStock");
        boolean ok = request.getItems().stream().allMatch(item -> {
            Inventory inv = repository.findByProductId(item.getProductId()).orElse(null);
            return inv != null && inv.getAvailableQuantity() >= item.getQuantity();
        });
        f.end(ok ? "ok" : "INSUFFICIENT");
        return new StockCheckResponse(ok);
    }

    @Transactional
    public void reserve(StockItemsRequest request) {
        FlowLog f = FlowLog.start("reserve");
        try {
            for (var item : request.getItems()) {
                Inventory inv = locked(item.getProductId());
                if (inv.getAvailableQuantity() < item.getQuantity()) {
                    throw new ApiException(HttpStatus.CONFLICT, "INSUFFICIENT_STOCK", "Not enough stock for product " + item.getProductId());
                }
                inv.setAvailableQuantity(inv.getAvailableQuantity() - item.getQuantity());
                inv.setReservedQuantity(inv.getReservedQuantity() + item.getQuantity());
                f.step("p=" + item.getProductId() + " qty=" + item.getQuantity() + " avail=" + inv.getAvailableQuantity());
            }
            f.endOk();
        } catch (RuntimeException e) {
            f.fail(e);
            throw e;
        }
    }

    @Transactional
    public void release(StockItemsRequest request) {
        FlowLog f = FlowLog.start("release");
        try {
            for (var item : request.getItems()) {
                Inventory inv = locked(item.getProductId());
                int qty = item.getQuantity();
                int fromReserved = Math.min(inv.getReservedQuantity(), qty);
                inv.setReservedQuantity(inv.getReservedQuantity() - fromReserved);
                inv.setAvailableQuantity(inv.getAvailableQuantity() + qty);
                f.step("p=" + item.getProductId() + " qty=" + qty);
            }
            f.endOk();
        } catch (RuntimeException e) {
            f.fail(e);
            throw e;
        }
    }

    @Transactional
    public void deduct(StockItemsRequest request) {
        FlowLog f = FlowLog.start("deduct");
        try {
            for (var item : request.getItems()) {
                Inventory inv = locked(item.getProductId());
                if (inv.getReservedQuantity() < item.getQuantity()) {
                    throw new ApiException(HttpStatus.CONFLICT, "INSUFFICIENT_STOCK", "Reserved stock missing for product " + item.getProductId());
                }
                inv.setReservedQuantity(inv.getReservedQuantity() - item.getQuantity());
                f.step("p=" + item.getProductId() + " qty=" + item.getQuantity());
            }
            f.endOk();
        } catch (RuntimeException e) {
            f.fail(e);
            throw e;
        }
    }

    private Inventory locked(Long productId) {
        return repository.findWithLockByProductId(productId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "INVENTORY_NOT_FOUND", "Inventory not found for product " + productId));
    }

    private Inventory unlocked(Long productId) {
        return repository.findByProductId(productId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "INVENTORY_NOT_FOUND", "Inventory not found for product " + productId));
    }

    private Inventory create(Long productId) {
        Inventory inv = new Inventory();
        inv.setProductId(productId);
        inv.setAvailableQuantity(0);
        inv.setReservedQuantity(0);
        return repository.save(inv);
    }
}
