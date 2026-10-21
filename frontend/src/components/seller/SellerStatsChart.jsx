import { money } from "../../utils/catalog";

export default function SellerStatsChart({ series = [], mode = "revenue" }) {
  if (!series.length) {
    return <p className="muted">Chưa có dữ liệu trong kỳ.</p>;
  }
  const values = series.map((d) => (mode === "orders" ? Number(d.orders) : Number(d.revenue || 0)));
  const max = Math.max(...values, 1);

  return (
    <div className="seller-chart" role="img" aria-label="Biểu đồ theo ngày">
      <div className="seller-chart-bars">
        {series.map((d) => {
          const v = mode === "orders" ? d.orders : d.revenue;
          const num = Number(v || 0);
          const h = Math.round((num / max) * 100);
          const label = d.date?.slice(5) || "";
          return (
            <div key={d.date} className="seller-chart-col" title={`${d.date}: ${mode === "orders" ? d.orders : money(d.revenue)}`}>
              <div className="seller-chart-bar-wrap">
                <div className="seller-chart-bar" style={{ height: `${Math.max(h, 4)}%` }} />
              </div>
              <span className="seller-chart-label">{label}</span>
            </div>
          );
        })}
      </div>
      <p className="muted seller-chart-caption">{mode === "orders" ? "Số đơn / ngày" : "Doanh thu / ngày (đơn đã xác nhận+)"}</p>
    </div>
  );
}
