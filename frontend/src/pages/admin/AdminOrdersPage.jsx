import { useEffect, useState } from "react";
import StatusChip from "../../components/seller/StatusChip.jsx";
import api from "../../services/api";
import { useDialog } from "../../context/DialogContext";
import { Empty, ErrorBanner, Loading } from "../../components/Feedback";
import { money, STATUS_LABEL } from "../../utils/catalog";
import { OPEN_ORDER, useAdminPlatform } from "./adminContext.js";

const NEXT_STATUS = {
  PENDING: "PROCESSING",
  PAYMENT_PENDING: "PROCESSING",
  CONFIRMED: "PROCESSING",
  PROCESSING: "SHIPPING",
  SHIPPING: "DELIVERED"
};

const NEXT_LABEL = {
  PROCESSING: "Bắt đầu xử lý",
  SHIPPING: "Chuyển giao hàng",
  DELIVERED: "Đã giao xong"
};

export default function AdminOrdersPage() {
  const { confirm, toast } = useDialog();
  const { setOpenOrderCount } = useAdminPlatform();
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("OPEN");

  const load = () =>
    api
      .get("/admin/orders")
      .then((r) => {
        const list = r.data.data || [];
        setRows(list);
        setOpenOrderCount?.(list.filter((o) => OPEN_ORDER.has(o.status)).length);
      })
      .catch(setError);

  useEffect(() => {
    void load();
  }, [setOpenOrderCount]);

  const patch = async (id, status) => {
    const label = STATUS_LABEL[status] || status;
    const okConfirm = await confirm({
      title: "Cập nhật trạng thái đơn?",
      message: `Chuyển đơn #${id} sang “${label}”. Khách sẽ nhận email cập nhật.`,
      confirmLabel: "Cập nhật",
      cancelLabel: "Huỷ"
    });
    if (!okConfirm) return;
    setError(null);
    try {
      await api.patch(`/admin/orders/${id}/status`, { status });
      toast({ title: "Đã cập nhật", message: `Đơn #${id} → ${label}`, variant: "ok" });
      load();
    } catch (err) {
      setError(err);
      toast({ title: "Cập nhật thất bại", message: err.message || "Thử lại sau.", variant: "error" });
    }
  };

  if (!rows) return <Loading text="Đang tải đơn…" />;

  const shown = rows.filter((o) => (filter === "OPEN" ? OPEN_ORDER.has(o.status) : true));

  return (
    <>
      <div className="dash-toolbar">
        <div className="tabs">
          <button type="button" className={`tab ${filter === "OPEN" ? "on" : ""}`} onClick={() => setFilter("OPEN")}>
            Đang mở
          </button>
          <button type="button" className={`tab ${filter === "ALL" ? "on" : ""}`} onClick={() => setFilter("ALL")}>
            Tất cả
          </button>
        </div>
      </div>
      <div className="admin-card">
        <ErrorBanner error={error} />
        {!shown.length ? (
          <Empty title="Không có đơn trong bộ lọc này" />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Đơn</th>
                <th>Shop</th>
                <th>Khách</th>
                <th>Email</th>
                <th>Trạng thái</th>
                <th className="num">Tổng</th>
                <th>Việc tiếp theo</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((o) => {
                const next = NEXT_STATUS[o.status];
                return (
                  <tr key={o.id}>
                    <td>#{o.id}</td>
                    <td>{o.shopName || o.shopId || "—"}</td>
                    <td>
                      {o.shippingName}
                      <div className="muted">{o.shippingAddress}</div>
                    </td>
                    <td>
                      {o.customerEmail ? (
                        <span className="email-cell">{o.customerEmail}</span>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                    <td>
                      <StatusChip status={o.status} labels={STATUS_LABEL} />
                    </td>
                    <td className="num">{money(o.totalAmount)}</td>
                    <td>
                      {next ? (
                        <button type="button" className="btn btn-sm" onClick={() => patch(o.id, next)}>
                          {NEXT_LABEL[next]}
                        </button>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
