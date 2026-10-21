import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import StatusChip from "../../components/seller/StatusChip.jsx";
import api from "../../services/api";
import { Empty, ErrorBanner, Loading } from "../../components/Feedback";
import { money, SHOP_STATUS_LABEL } from "../../utils/catalog";
import { aggregateShopRevenue, platformGmv } from "./adminRevenue.js";
import { PlatformPage } from "./PlatformPage.jsx";

export default function AdminOverview() {
  const [orders, setOrders] = useState([]);
  const [shops, setShops] = useState([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void Promise.all([api.get("/admin/orders"), api.get("/admin/shops"), api.get("/admin/users")])
      .then(([ordersRes, shopsRes, usersRes]) => {
        setOrders(ordersRes.data.data || []);
        setShops(shopsRes.data.data || []);
        const users = usersRes.data.data || [];
        setCustomerCount(users.filter((u) => String(u.role).toUpperCase() === "CUSTOMER").length);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  const shopRows = useMemo(() => aggregateShopRevenue(orders, shops), [orders, shops]);
  const maxRevenue = useMemo(() => Math.max(...shopRows.map((r) => r.revenue), 1), [shopRows]);
  const gmv = useMemo(() => platformGmv(orders), [orders]);
  const pendingCount = shops.filter((s) => s.status === "PENDING").length;
  const approvedCount = shops.filter((s) => s.status === "APPROVED").length;

  if (error) {
    return (
      <PlatformPage>
        <ErrorBanner error={error} />
      </PlatformPage>
    );
  }
  if (loading) return <Loading text="Đang tải tổng quan..." className="platform-loading" />;

  return (
    <PlatformPage>
      <div className="platform-kpi-row">
        <div className="platform-kpi platform-kpi-primary">
          <span className="platform-kpi-label">Doanh thu sàn (GMV)</span>
          <strong>{money(gmv)}</strong>
          <span className="platform-kpi-sub">{orders.length} đơn tổng</span>
        </div>
        <div className="platform-kpi">
          <span className="platform-kpi-label">Gian hàng đang bán</span>
          <strong>{approvedCount}</strong>
          <Link to="/admin/shops" className="platform-kpi-link">
            Quản lý →
          </Link>
        </div>
        <div className="platform-kpi">
          <span className="platform-kpi-label">Chờ duyệt</span>
          <strong>{pendingCount}</strong>
          {pendingCount > 0 && (
            <Link to="/admin/shops" className="platform-kpi-link">
              Duyệt →
            </Link>
          )}
        </div>
        <div className="platform-kpi">
          <span className="platform-kpi-label">Khách hàng</span>
          <strong>{customerCount}</strong>
          <Link to="/admin/customers" className="platform-kpi-link">
            Xem →
          </Link>
        </div>
      </div>

      <section className="platform-panel">
        <div className="platform-panel-head">
          <h2>Doanh thu theo gian hàng</h2>
          <span className="muted">Đơn đã xác nhận · đang xử lý · giao · hoàn tất</span>
        </div>
        {shopRows.length === 0 ? (
          <div className="platform-panel-empty">
            <Empty title="Chưa có dữ liệu doanh thu" />
          </div>
        ) : (
          <div className="platform-table-wrap">
            <table className="data-table platform-table">
              <thead>
                <tr>
                  <th>Gian hàng</th>
                  <th>Trạng thái</th>
                  <th className="num">Số đơn</th>
                  <th className="num">Doanh thu</th>
                  <th>Tỷ trọng</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {shopRows.map((row) => {
                  const pct = Math.round((row.revenue / maxRevenue) * 100);
                  return (
                    <tr key={row.shopId}>
                      <td>
                        <span className="cell-title">{row.name}</span>
                        {row.slug ? <span className="cell-meta">/{row.slug}</span> : null}
                      </td>
                      <td>
                        <StatusChip status={row.status} labels={SHOP_STATUS_LABEL} />
                      </td>
                      <td className="num">{row.orderCount}</td>
                      <td className="num platform-revenue-num">{money(row.revenue)}</td>
                      <td>
                        <div className="platform-revenue-track" title={`${pct}% so với shop cao nhất`}>
                          <div className="platform-revenue-fill" style={{ width: `${pct}%` }} />
                        </div>
                      </td>
                      <td>
                        <Link to={`/admin/shops/${row.shopId}`}>Chi tiết</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </PlatformPage>
  );
}
