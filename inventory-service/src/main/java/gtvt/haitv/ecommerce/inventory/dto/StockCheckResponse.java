package gtvt.haitv.ecommerce.inventory.dto;

public class StockCheckResponse {
    private boolean available;
    public StockCheckResponse(boolean available) { this.available = available; }
    public boolean isAvailable() { return available; }
}
