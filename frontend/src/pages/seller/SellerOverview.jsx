import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SellerStatsChart from "../../components/seller/SellerStatsChart.jsx";
import StatusChip from "../../components/seller/StatusChip.jsx";
import api from "../../services/api";
import { Empty, ErrorBanner, Loading } from "../../components/Feedback";
import { money, STATUS_LABEL, labelOf } from "../../utils/catalog";
import { OPEN_ORDER_STATUSES, useSellerShop } from "./sellerContext.js";

export default function SellerOverview() {
  const { shop, setOpenOrderCount } = useSellerShop();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [lowStock, setLowStock] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [chartMode, setChartMode] = useState("revenue");
  const [error, setError] = useState(null);

  useEffect(() => {
    void Promise.all([
      api.get("/orders/seller-stats", { params: { shopId: shop.id, days: 7 } }),
      api.get("/orders/seller", { params: { shopId: shop.id } }),
      api.get("/products", { params: { shopId: shop.id, size: 1 } }),
      api.get("/products", { params: { shopId: shop.id, size: 100 } }),
      api.get("/inventory")
    ])
      .then(([st, ord, pMeta, pFull, inv]) => {
        setStats(st.data.data);
        const list = ord.data.data || [];
        setOrders(list);
        const open = list.filter((o) => OPEN_ORDER_STATUSES.has(o.status));
        setOpenOrderCount?.(open.length);
        setProductCount(pMeta.data.data?.totalElements ?? pFull.data.data?.content?.length ?? 0);
        const products = pFull.data.data?.content || [];
        const invMap = Object.fromEntries((inv.data.data || []).map((r) => [r.productId, r]));
        const low = products.filter((p) => Number(invMap[p.id]?.availableQuantity ?? 0) <= 5).length;
        setLowStock(low);
      })
      .catch(setError);
  }, [shop.id, setOpenOrderCount]);

  if (error) return <ErrorBanner error={error} />;
  if (!stats) return <Loading text="Đang tải tổng quan..." />;

  const open = orders.filter((o) => OPEN_ORDER_STATUSES.has(o.status));
  const summary = stats.summary || {};

  return (
    <>
      <div className="kpi-grid seller-kpi-grid">
        <Link to="/seller/orders" className="stat kpi" style={{ textDecoration: "none", color: "inherit" }}>
          <span>Đơn cần xử lý</span>
          <strong>{open.length}</strong>
          <em>Xem đơn hàng →</em>
        </Link>
        <div className="stat kpi">
          <span>Doanh thu 7 ngày</span>
          <strong>{money(summary.revenue)}</strong>
          <em>{summary.orderCount} đơn trong kỳ</em>
        </div>
        <Link to="/seller/inventory" className="stat kpi" style={{ textDecoration: "none", color: "inherit" }}>
          <span>Sắp hết hàng</span>
          <strong>{lowStock}</strong>
          <em>Cập nhật tồn →</em>
        </Link>
        <Link to="/seller/products" className="stat kpi" style={{ textDecoration: "none", color: "inherit" }}>
          <span>Sản phẩm</span>
          <strong>{productCount}</strong>
          <em>Quản lý catalog →</em>
        </Link>
      </div>

      <div className="work-grid">
        <div className="admin-card">
          <div className="panel-title">
            <h2>Hiệu suất 7 ngày</h2>
            <div className="tabs">
              <button type="button" className={`tab ${chartMode === "revenue" ? "on" : ""}`} onClick={() => setChartMode("revenue")}>
                Doanh thu
              </button>
              <button type="button" className={`tab ${chartMode === "orders" ? "on" : ""}`} onClick={() => setChartMode("orders")}>
                Đơn hàng
              </button>
            </div>
          </div>
          <SellerStatsChart series={stats.series} mode={chartMode} />
        </div>
        <div className="admin-card">
          <h2>Việc nên làm</h2>
          <ul className="seller-checklist">
            {open.length > 0 && (
              <li>
                <Link to="/seller/orders">Xử lý {open.length} đơn đang mở</Link>
              </li>
            )}
            {lowStock > 0 && (
              <li>
                <Link to="/seller/inventory">Bổ sung tồn cho {lowStock} sản phẩm</Link>
              </li>
            )}
            {open.length === 0 && lowStock === 0 && <li className="muted">Không có việc gấp — theo dõi biểu đồ bên trái.</li>}
          </ul>
        </div>
      </div>

      <div className="admin-card">
        <div className="panel-title">
          <h2>Hàng đợi đơn bán</h2>
          <Link to="/seller/orders" className="linkish">
            Tất cả
          </Link>
        </div>
        {open.length === 0 ? (
          <Empty title="Chưa có đơn mở" text="Khi khách đặt, đơn sẽ hiện ở đây." />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Đơn</th>
                <th>Khách</th>
                <th>Trạng thái</th>
                <th className="num">Tổng</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {open.slice(0, 8).map((o) => (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td className="muted">{o.customerEmail || "—"}</td>
                  <td>
                    <StatusChip status={o.status} labels={STATUS_LABEL} />
                  </td>
                  <td className="num">{money(o.totalAmount)}</td>
                  <td>
                    <Link to={`/seller/orders/${o.id}?shopId=${shop.id}`}>Chi tiết</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
