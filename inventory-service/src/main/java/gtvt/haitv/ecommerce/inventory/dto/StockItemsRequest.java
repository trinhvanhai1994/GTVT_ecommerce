package gtvt.haitv.ecommerce.inventory.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class StockItemsRequest {
    @NotEmpty
    @Valid
    private List<Item> items;

    @Getter
    @Setter
    @NoArgsConstructor
    public static class Item {
        @NotNull private Long productId;
        @NotNull @Min(1) private Integer quantity;
    }
}
