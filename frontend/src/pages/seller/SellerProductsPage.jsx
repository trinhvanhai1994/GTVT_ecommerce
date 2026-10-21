import { useEffect, useState } from "react";
import StatusChip from "../../components/seller/StatusChip.jsx";
import api from "../../services/api";
import { useDialog } from "../../context/DialogContext";
import { Empty, ErrorBanner, Loading } from "../../components/Feedback";
import { money, productImage } from "../../utils/catalog";
import { useSellerShop } from "./sellerContext.js";

const emptyProd = { name: "", description: "", price: "", categoryId: "", brand: "", status: "ACTIVE", imageUrl: "" };

export default function SellerProductsPage() {
  const { shop } = useSellerShop();
  const { confirm, toast } = useDialog();
  const [cats, setCats] = useState([]);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [stockMap, setStockMap] = useState({});
  const [form, setForm] = useState(emptyProd);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const size = 10;

  const reload = async (p = page, kw = keyword) => {
    setLoading(true);
    try {
      const [c, pr, inv] = await Promise.all([
        api.get("/products/categories", { params: { shopId: shop.id } }),
        api.get("/products", { params: { shopId: shop.id, keyword: kw || undefined, page: p, size } }),
        api.get("/inventory")
      ]);
      setCats(c.data.data || []);
      setProducts(pr.data.data?.content || []);
      setTotal(pr.data.data?.totalElements ?? 0);
      setStockMap(Object.fromEntries((inv.data.data || []).map((r) => [r.productId, r.availableQuantity])));
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, [shop.id, page]);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    const payload = {
      shopId: shop.id,
      name: form.name,
      description: form.description,
      price: Number(form.price),
      categoryId: Number(form.categoryId),
      brand: form.brand,
      status: form.status,
      imageUrl: form.imageUrl || undefined
    };
    try {
      if (editId) {
        await api.put(`/products/${editId}`, payload);
        toast({ title: "Đã cập nhật", variant: "ok" });
      } else {
        await api.post("/products", payload);
        toast({ title: "Đã thêm sản phẩm", variant: "ok" });
      }
      setForm(emptyProd);
      setEditId(null);
      await reload();
    } catch (err) {
      setError(err);
    }
  };

  const startEdit = (p) => {
    setEditId(p.id);
    setForm({
      name: p.name || "",
      description: p.description || "",
      price: String(p.price ?? ""),
      categoryId: String(p.categoryId ?? ""),
      brand: p.brand || "",
      status: p.status || "ACTIVE",
      imageUrl: p.imageUrl || ""
    });
  };

  const remove = async (id) => {
    const ok = await confirm({ title: "Xóa sản phẩm?", message: "Không hoàn tác.", danger: true, confirmLabel: "Xóa" });
    if (!ok) return;
    try {
      await api.delete(`/products/${id}`);
      toast({ title: "Đã xóa", variant: "ok" });
      await reload();
    } catch (err) {
      setError(err);
    }
  };

  const search = (e) => {
    e.preventDefault();
    setPage(0);
    void reload(0, keyword);
  };

  const pages = Math.max(1, Math.ceil(total / size));

  return (
    <div className="catalog-split">
      <div>
        <ErrorBanner error={error} />
        <form className="seller-toolbar" onSubmit={search}>
          <input
            className="search-inline"
            placeholder="Tìm tên sản phẩm…"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button type="submit" className="btn btn-sm">
            Tìm
          </button>
        </form>
        <div className="admin-card">
          {loading ? (
            <Loading />
          ) : products.length === 0 ? (
            <Empty title="Chưa có sản phẩm" />
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>SP</th>
                  <th>Giá</th>
                  <th>Tồn</th>
                  <th>TT</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="seller-product-cell">
                        <img src={productImage(p)} alt="" width={40} height={40} />
                        <span>
                          {p.name}
                          <small className="muted"> #{p.id}</small>
                        </span>
                      </div>
                    </td>
                    <td className="num">{money(p.price)}</td>
                    <td className={`num ${Number(stockMap[p.id] ?? 0) <= 5 ? "stock-low" : ""}`}>{stockMap[p.id] ?? 0}</td>
                    <td>
                      <StatusChip status={p.status} />
                    </td>
                    <td className="row-actions">
                      <button type="button" onClick={() => startEdit(p)}>
                        Sửa
                      </button>
                      <button type="button" onClick={() => remove(p.id)}>
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {total > size && (
            <div className="pager">
              <button type="button" className="btn btn-sm" disabled={page <= 0} onClick={() => setPage((p) => p - 1)}>
                Trước
              </button>
              <span className="muted">
                {page + 1} / {pages}
              </span>
              <button type="button" className="btn btn-sm" disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)}>
                Sau
              </button>
            </div>
          )}
        </div>
      </div>
      <form className="form-card admin-form" onSubmit={submit}>
        <h2>{editId ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h2>
        <label>
          Tên
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label>
          Danh mục
          <select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
            <option value="">—</option>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Giá (VND)
          <input required type="number" min="1000" step="1000" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        </label>
        <label>
          Thương hiệu
          <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
        </label>
        <label>
          Ảnh (URL)
          <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://…" />
        </label>
        <label>
          Trạng thái
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="ACTIVE">Đang bán</option>
            <option value="INACTIVE">Ẩn</option>
          </select>
        </label>
        <label>
          Mô tả
          <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </label>
        <div className="row-actions">
          <button className="btn" disabled={!cats.length}>
            {editId ? "Cập nhật" : "Thêm mới"}
          </button>
          {editId && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setEditId(null);
                setForm(emptyProd);
              }}
            >
              Hủy sửa
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
