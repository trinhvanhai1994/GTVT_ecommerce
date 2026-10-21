import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import api from "../services/api";
import { ErrorBanner, Loading } from "../components/Feedback";
import { useAuth } from "../context/AuthContext";
import { SHOP_STATUS_LABEL, labelOf } from "../utils/catalog";

export default function RegisterShopPage() {
  const { isAuthenticated, isPlatformAdmin, isSeller, user, refreshProfile } = useAuth();
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    logoUrl: "",
    contactEmail: user?.email || ""
  });
  const [mine, setMine] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    api
      .get("/shops/me")
      .then((r) => setMine(r.data.data))
      .catch(() => setMine(null))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: "/register-shop" }} />;
  }
  if (isPlatformAdmin) {
    return <Navigate to="/admin" replace />;
  }
  if (isSeller) {
    return <Navigate to="/seller" replace />;
  }
  if (loading) return <Loading />;

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.post("/shops", form);
      await refreshProfile();
      navigate("/seller", { replace: true });
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  if (mine?.status === "APPROVED") {
    return <Navigate to="/seller" replace />;
  }

  if (mine) {
    return (
      <section className="form-card narrow">
        <p className="eyebrow">Hồ sơ cửa hàng</p>
        <h1>{mine.name}</h1>
        <p className="muted">
          Trạng thái: <strong>{labelOf(SHOP_STATUS_LABEL, mine.status)}</strong>
          {mine.rejectReason ? ` — ${mine.rejectReason}` : ""}
        </p>
        {mine.status === "PENDING" && (
          <p>
            Hồ sơ đang chờ Nava duyệt. Khi được duyệt, email <strong>{mine.contactEmail || "shop"}</strong> sẽ nhận mật khẩu tạm và hướng dẫn vào Kênh người bán.
          </p>
        )}
        {mine.status === "REJECTED" && (
          <p className="muted">Hồ sơ chưa được duyệt. Bạn có thể liên hệ hỗ trợ hoặc gửi lại sau khi bổ sung thông tin.</p>
        )}
      </section>
    );
  }

  return (
    <section className="form-card narrow">
      <p className="eyebrow">Mở gian hàng</p>
      <h1>Đăng ký bán hàng</h1>
      <ErrorBanner error={error} />
      <form onSubmit={submit}>
        <label>
          Tên cửa hàng
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label>
          Đường dẫn cửa hàng
          <input
            required
            pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
            placeholder="vi-du-cua-hang"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase() })}
          />
        </label>
        <label>
          Mô tả
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
        </label>
        <label>
          Liên kết ảnh logo
          <input value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} placeholder="https://…" />
        </label>
        <label>
          Email liên hệ shop (nhận thông tin sau duyệt)
          <input
            required
            type="email"
            value={form.contactEmail}
            onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
          />
        </label>
        <button className="btn btn-lg" disabled={saving}>
          {saving ? "Đang gửi…" : "Gửi hồ sơ"}
        </button>
      </form>
    </section>
  );
}
