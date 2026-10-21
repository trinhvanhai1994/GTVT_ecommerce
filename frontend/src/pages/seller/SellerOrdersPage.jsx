import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import StatusChip from "../../components/seller/StatusChip.jsx";
import api from "../../services/api";
import { Empty, Loading } from "../../components/Feedback";
import { money, STATUS_LABEL } from "../../utils/catalog";
import { OPEN_ORDER_STATUSES, useSellerShop } from "./sellerContext.js";

const TABS = [
  { id: "all", label: "Tất cả", filter: () => true },
  { id: "open", label: "Cần xử lý", filter: (o) => OPEN_ORDER_STATUSES.has(o.status) },
  { id: "shipping", label: "Đang giao", filter: (o) => o.status === "SHIPPING" },
  { id: "done", label: "Hoàn tất", filter: (o) => o.status === "DELIVERED" },
  { id: "cancel", label: "Huỷ", filter: (o) => o.status === "CANCELLED" || o.status === "PAYMENT_FAILED" }
];

export default function SellerOrdersPage() {
  const { shop, setOpenOrderCount } = useSellerShop();
  const [orders, setOrders] = useState(null);
  const [tab, setTab] = useState("open");
  const [q, setQ] = useState("");

  useEffect(() => {
    api.get("/orders/seller", { params: { shopId: shop.id } }).then((r) => {
      const list = r.data.data || [];
      setOrders(list);
      setOpenOrderCount?.(list.filter((o) => OPEN_ORDER_STATUSES.has(o.status)).length);
    });
  }, [shop.id, setOpenOrderCount]);

  const filtered = useMemo(() => {
    if (!orders) return [];
    const t = TABS.find((x) => x.id === tab) || TABS[0];
    let list = orders.filter(t.filter);
    const needle = q.trim().replace(/^#/, "");
    if (needle) list = list.filter((o) => String(o.id).includes(needle));
    return list;
  }, [orders, tab, q]);

  if (!orders) return <Loading text="Đang tải đơn..." />;

  return (
    <>
      <div className="seller-toolbar">
        <div className="tabs">
          {TABS.map((t) => (
            <button key={t.id} type="button" className={`tab ${tab === t.id ? "on" : ""}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
        <input
          className="search-inline"
          placeholder="Tìm mã đơn #…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div className="admin-card">
        {filtered.length === 0 ? (
          <Empty title="Không có đơn" />
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
              {filtered.map((o) => (
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
