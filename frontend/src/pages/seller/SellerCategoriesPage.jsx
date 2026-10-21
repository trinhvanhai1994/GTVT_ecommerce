import { useEffect, useState } from "react";
import api from "../../services/api";
import { useDialog } from "../../context/DialogContext";
import { Empty, ErrorBanner, Loading } from "../../components/Feedback";
import { useSellerShop } from "./sellerContext.js";

export default function SellerCategoriesPage() {
  const { shop } = useSellerShop();
  const { confirm, toast } = useDialog();
  const [cats, setCats] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState(null);

  const reload = () =>
    api
      .get("/products/categories", { params: { shopId: shop.id } })
      .then((r) => setCats(r.data.data || []))
      .catch(setError);

  useEffect(() => {
    void reload();
  }, [shop.id]);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (editId) {
        await api.put(`/products/categories/${editId}`, { ...form, shopId: shop.id });
        toast({ title: "Đã cập nhật danh mục", variant: "ok" });
      } else {
        await api.post("/products/categories", { ...form, shopId: shop.id });
        toast({ title: "Đã thêm danh mục", variant: "ok" });
      }
      setForm({ name: "", description: "" });
      setEditId(null);
      await reload();
    } catch (err) {
      setError(err);
    }
  };

  const startEdit = (c) => {
    setEditId(c.id);
    setForm({ name: c.name || "", description: c.description || "" });
  };

  const remove = async (id) => {
    const ok = await confirm({ title: "Xóa danh mục?", danger: true, confirmLabel: "Xóa" });
    if (!ok) return;
    try {
      await api.delete(`/products/categories/${id}`);
      toast({ title: "Đã xóa", variant: "ok" });
      await reload();
    } catch (err) {
      setError(err);
    }
  };

  if (!cats) return <Loading />;

  return (
    <div className="catalog-split">
      <div className="admin-card">
        <ErrorBanner error={error} />
        {cats.length === 0 ? (
          <Empty title="Chưa có danh mục" text="Thêm danh mục bên phải trước khi tạo sản phẩm." />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Tên</th>
                <th>Mô tả</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {cats.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.name}</strong>
                    <small className="muted"> #{c.id}</small>
                  </td>
                  <td className="muted">{c.description || "—"}</td>
                  <td className="row-actions">
                    <button type="button" onClick={() => startEdit(c)}>
                      Sửa
                    </button>
                    <button type="button" onClick={() => remove(c.id)}>
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <form className="form-card admin-form" onSubmit={submit}>
        <h2>{editId ? "Sửa danh mục" : "Thêm danh mục"}</h2>
        <label>
          Tên
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label>
          Mô tả
          <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </label>
        <button className="btn">{editId ? "Cập nhật" : "Lưu"}</button>
      </form>
    </div>
  );
}
