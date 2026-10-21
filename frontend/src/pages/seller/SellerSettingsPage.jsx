import { useState } from "react";
import CopyShopLink from "../../components/seller/CopyShopLink.jsx";
import api from "../../services/api";
import { useDialog } from "../../context/DialogContext";
import { ErrorBanner } from "../../components/Feedback";
import { useSellerShop } from "./sellerContext.js";

export default function SellerSettingsPage() {
  const { shop, setShop } = useSellerShop();
  const { toast } = useDialog();
  const [form, setForm] = useState({
    name: shop.name || "",
    slug: shop.slug || "",
    description: shop.description || "",
    logoUrl: shop.logoUrl || "",
    contactEmail: shop.contactEmail || ""
  });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const { data } = await api.put("/shops/me", form);
      setShop?.(data.data);
      toast({ title: "Đã lưu hồ sơ shop", variant: "ok" });
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="catalog-split">
      <form className="form-card admin-form" onSubmit={submit}>
        <h2>Hồ sơ gian hàng</h2>
        <ErrorBanner error={error} />
        <label>
          Tên cửa hàng
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label>
          Đường dẫn (slug)
          <input
            required
            pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase() })}
          />
        </label>
        <label>
          Email liên hệ
          <input required type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
        </label>
        <label>
          Logo (URL)
          <input value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} />
        </label>
        <label>
          Mô tả
          <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </label>
        <button className="btn" disabled={saving}>
          {saving ? "Đang lưu…" : "Lưu thay đổi"}
        </button>
      </form>
      <div className="admin-card">
        <h2>Liên kết công khai</h2>
        <p className="muted">Seller không xem vitrine trong cùng phiên — sao chép link và mở tab ẩn danh.</p>
        <CopyShopLink shopId={shop.id} slug={shop.slug} />
      </div>
    </div>
  );
}
