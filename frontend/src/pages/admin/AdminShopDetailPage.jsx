import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import StatusChip from "../../components/seller/StatusChip.jsx";
import api from "../../services/api";
import { Empty, ErrorBanner, Loading } from "../../components/Feedback";
import { money, SHOP_STATUS_LABEL, labelOf } from "../../utils/catalog";
import { aggregateShopRevenue } from "./adminRevenue.js";
import { PlatformPage } from "./PlatformPage.jsx";

export default function AdminShopDetailPage() {
  const { shopId } = useParams();
  const [shop, setShop] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!shopId) return;
    const sid = Number(shopId);
    void Promise.all([
      api.get(`/shops/id/${sid}`),
      api.get("/admin/orders"),
      api.get("/products", { params: { shopId: sid, size: 20 } })
    ])
      .then(([shopRes, ordRes, prodRes]) => {
        setShop(shopRes.data.data);
        const all = ordRes.data.data || [];
        setOrders(all.filter((o) => Number(o.shopId) === sid));
        setProducts(prodRes.data.data?.content || []);
      })
      .catch(setError);
  }, [shopId]);

  const revenueRow = useMemo(() => {
    if (!shop) return null;
    const rows = aggregateShopRevenue(orders, [shop]);
    return rows[0] || { revenue: 0, orderCount: 0 };
  }, [shop, orders]);

  if (!shopId) {
    return (
      <PlatformPage>
        <ErrorBanner error={{ message: "Thiếu shopId" }} />
      </PlatformPage>
    );
  }
  if (!shop && !error) return <Loading text="Đang tải shop…" className="platform-loading" />;

  return (
    <PlatformPage>
      <Link className="platform-crumb" to="/admin/shops">
        ← Quay lại danh sách gian hàng
      </Link>
      <ErrorBanner error={error} />
      {shop && (
        <section className="platform-panel platform-panel-compact">
          <div className="platform-shop-hero">
            <div>
              <h2>{shop.name}</h2>
              <p className="muted">
                #{shop.id} · /{shop.slug} · {labelOf(SHOP_STATUS_LABEL, shop.status)} · {shop.contactEmail || "—"} · owner #
                {shop.ownerUserId}
              </p>
              <StatusChip status={shop.status} labels={SHOP_STATUS_LABEL} />
            </div>
            <div className="platform-shop-stats">
              <div>
                <span className="platform-kpi-label">Doanh thu</span>
                <strong className="platform-revenue-num">{money(revenueRow?.revenue || 0)}</strong>
              </div>
              <div>
                <span className="platform-kpi-label">Đơn tính GMV</span>
                <strong>{revenueRow?.orderCount || 0}</strong>
              </div>
            </div>
          </div>
        </section>
      )}
      <section className="platform-panel">
        <div className="platform-panel-head">
          <h2>Sản phẩm</h2>
          <span className="muted">{products.length} mục (xem nhanh)</span>
        </div>
        {products.length === 0 ? (
          <div className="platform-panel-empty">
            <Empty title="Chưa có sản phẩm" />
          </div>
        ) : (
          <div className="platform-table-wrap">
            <table className="data-table platform-table">
              <thead>
                <tr>
                  <th>Tên</th>
                  <th className="num">Giá</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      {p.name}
                      <small className="muted"> #{p.id}</small>
                    </td>
                    <td className="num">{money(p.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </PlatformPage>
  );
}
