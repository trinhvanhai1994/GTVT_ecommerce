import { useEffect, useState } from "react";
import api from "../../services/api";
import { useDialog } from "../../context/DialogContext";
import { ErrorBanner, Loading } from "../../components/Feedback";
import { PlatformPage } from "./PlatformPage.jsx";

function roleLabel(role) {
  const r = String(role || "").toUpperCase();
  if (r === "PLATFORM_ADMIN" || r === "ADMIN") return "Quản trị sàn";
  if (r === "SELLER") return "Người bán";
  return "Khách hàng";
}

export default function AdminCustomersPage() {
  const { confirm, toast } = useDialog();
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(null);

  const load = () =>
    api
      .get("/admin/users")
      .then((r) => {
        const list = (r.data.data || []).filter((u) => String(u.role).toUpperCase() === "CUSTOMER");
        setRows(list);
      })
      .catch(setError);

  useEffect(() => {
    void load();
  }, []);

  const toggleStatus = async (u) => {
    const next = u.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const ok = await confirm({
      title: next === "INACTIVE" ? "Khóa tài khoản?" : "Mở khóa tài khoản?",
      message: `${u.email} → ${next}`
    });
    if (!ok) return;
    try {
      await api.patch(`/admin/users/${u.id}/status`, { status: next });
      toast({ title: "Đã cập nhật", message: `${u.email}: ${next}`, variant: "ok" });
      load();
    } catch (e) {
      setError(e);
    }
  };

  if (!rows) return <Loading text="Đang tải khách hàng…" className="platform-loading" />;

  return (
    <PlatformPage>
      <ErrorBanner error={error} />
      <section className="platform-panel">
        <div className="platform-panel-head">
          <h2>Tài khoản khách hàng</h2>
          <span className="muted">{rows.length} tài khoản</span>
        </div>
        <div className="platform-table-wrap">
          <table className="data-table platform-table">
            <thead>
              <tr>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id}>
                  <td>{u.fullName}</td>
                  <td className="email-cell">{u.email}</td>
                  <td>
                    <span className={`chip-admin ${u.role}`}>{roleLabel(u.role)}</span>
                  </td>
                  <td>{u.status}</td>
                  <td>
                    <button type="button" className="btn btn-sm btn-ghost" onClick={() => toggleStatus(u)}>
                      {u.status === "ACTIVE" ? "Khóa" : "Mở khóa"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </PlatformPage>
  );
}
