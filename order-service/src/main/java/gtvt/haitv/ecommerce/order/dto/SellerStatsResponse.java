package gtvt.haitv.ecommerce.order.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class SellerStatsResponse {
    private Summary summary = new Summary();
    private List<DayPoint> series = new ArrayList<>();

    @Getter
    @Setter
    @NoArgsConstructor
    public static class Summary {
        private long orderCount;
        private BigDecimal revenue = BigDecimal.ZERO;
        private long openOrders;
        private long cancelledCount;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class DayPoint {
        private String date;
        private long orders;
        private BigDecimal revenue = BigDecimal.ZERO;

        public DayPoint(String date, long orders, BigDecimal revenue) {
            this.date = date;
            this.orders = orders;
            this.revenue = revenue != null ? revenue : BigDecimal.ZERO;
        }
    }
}
