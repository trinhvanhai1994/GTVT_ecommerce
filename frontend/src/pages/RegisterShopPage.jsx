import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import api from "../services/api";
import { ErrorBanner, Loading } from "../components/Feedback";
import { useAuth } from "../context/AuthContext";
import { SHOP_STATUS_LABEL, labelOf } from "../utils/catalog";

export default function RegisterShopPage() {
  const { isAuthenticated, isPlatformAdmin } = useAuth();
  const [form, setForm] = useState({ name: "", slug: "", description: "", logoUrl: "" });
  const [mine, setMine] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
  if (loading) return <Loading />;

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const { data } = await api.post("/shops", form);
      setMine(data.data);
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  };

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
            Hồ sơ đang chờ Nava duyệt. Khi được duyệt, cửa hàng sẽ hiện trên trang chủ.{" "}
            <strong>Đăng xuất rồi đăng nhập lại</strong> để mở Kênh người bán.
          </p>
        )}
        {mine.status === "APPROVED" && (
          <>
            <p className="muted">Nếu chưa vào được Kênh người bán, hãy đăng nhập lại.</p>
            <Link className="btn" to="/seller">
              Vào Kênh người bán
            </Link>
          </>
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
        <button className="btn btn-lg" disabled={saving}>
          {saving ? "Đang gửi…" : "Gửi hồ sơ"}
        </button>
      </form>
    </section>
  );
}
