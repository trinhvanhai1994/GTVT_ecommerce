import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StatusChip from "../../components/seller/StatusChip.jsx";
import api from "../../services/api";
import { useDialog } from "../../context/DialogContext";
import { Empty, ErrorBanner, Loading } from "../../components/Feedback";
import { SHOP_STATUS_LABEL } from "../../utils/catalog";
import { PlatformPage, PlatformToolbar } from "./PlatformPage.jsx";

export default function AdminShopsPage() {
  const [shops, setShops] = useState(null);
  const [error, setError] = useState(null);
  const [reason, setReason] = useState("");
  const [tab, setTab] = useState("all");
  const { confirm, toast } = useDialog();

  const load = () =>
    api
      .get("/admin/shops")
      .then((r) => setShops(r.data.data || []))
      .catch(setError);

  useEffect(() => {
    void load();
  }, []);

  const act = async (id, action) => {
    const shop = shops.find((s) => s.id === id);
    try {
      if (action === "reject") {
        const ok = await confirm({ title: "Từ chối shop?", message: "Nhập lý do từ chối." });
        if (!ok) return;
        await api.patch(`/admin/shops/${id}/reject`, { reason: reason || "Không đủ điều kiện" });
      } else {
        await api.patch(`/admin/shops/${id}/${action}`);
      }
      if (action === "approve") {
        toast({
          title: "Đã duyệt gian hàng",
          message: `Email thông tin đăng nhập đã gửi tới ${shop?.contactEmail || "contactEmail"}.`,
          variant: "ok"
        });
      }
      await load();
    } catch (e) {
      setError(e);
    }
  };

  if (!shops) return <Loading text="Đang tải gian hàng…" className="platform-loading" />;

  const filtered =
    tab === "pending"
      ? shops.filter((s) => s.status === "PENDING")
      : tab === "approved"
        ? shops.filter((s) => s.status === "APPROVED")
        : shops;

  return (
    <PlatformPage
      toolbar={
        <PlatformToolbar>
          <div className="tabs platform-tabs">
            <button type="button" className={`tab ${tab === "all" ? "on" : ""}`} onClick={() => setTab("all")}>
              Tất cả
            </button>
            <button type="button" className={`tab ${tab === "pending" ? "on" : ""}`} onClick={() => setTab("pending")}>
              Chờ duyệt
            </button>
            <button type="button" className={`tab ${tab === "approved" ? "on" : ""}`} onClick={() => setTab("approved")}>
              Đang bán
            </button>
          </div>
          <label className="platform-inline-field">
            <span className="sr-only">Lý do từ chối</span>
            <input placeholder="Lý do từ chối…" value={reason} onChange={(e) => setReason(e.target.value)} />
          </label>
        </PlatformToolbar>
      }
    >
      <ErrorBanner error={error} />
      <section className="platform-panel">
        <div className="platform-panel-head">
          <h2>Danh sách gian hàng</h2>
          <span className="muted">{filtered.length} / {shops.length} shop</span>
        </div>
        {filtered.length === 0 ? (
          <div className="platform-panel-empty">
            <Empty title="Không có gian hàng" />
          </div>
        ) : (
          <div className="platform-table-wrap">
            <table className="data-table platform-table">
              <thead>
                <tr>
                  <th>Gian hàng</th>
                  <th>Email</th>
                  <th>Trạng thái</th>
                  <th className="col-actions">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <span className="cell-title">{s.name}</span>
                      <span className="cell-meta">/{s.slug}</span>
                    </td>
                    <td className="email-cell">{s.contactEmail || "—"}</td>
                    <td>
                      <StatusChip status={s.status} labels={SHOP_STATUS_LABEL} />
                    </td>
                    <td className="row-actions">
                      <Link to={`/admin/shops/${s.id}`}>Chi tiết</Link>
                      {s.status !== "APPROVED" && (
                        <button type="button" onClick={() => act(s.id, "approve")}>
                          Duyệt
                        </button>
                      )}
                      <button type="button" onClick={() => act(s.id, "reject")}>
                        Từ chối
                      </button>
                      <button type="button" onClick={() => act(s.id, "suspend")}>
                        Tạm ngưng
                      </button>
                    </td>
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
