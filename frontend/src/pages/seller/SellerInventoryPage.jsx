import { useEffect, useState } from "react";
import api from "../../services/api";
import { ErrorBanner, Loading } from "../../components/Feedback";
import { useSellerShop } from "./sellerContext.js";

export default function SellerInventoryPage() {
  const { shop } = useSellerShop();
  const [rows, setRows] = useState(null);
  const [draft, setDraft] = useState({});
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void Promise.all([
      api.get("/products", { params: { shopId: shop.id, size: 100 } }),
      api.get("/inventory")
    ])
      .then(([p, inv]) => {
        const products = p.data.data?.content || [];
        const map = Object.fromEntries((inv.data.data || []).map((r) => [r.productId, r]));
        setRows(products.map((pr) => ({ ...pr, stock: map[pr.id]?.availableQuantity ?? 0 })));
      })
      .catch(setError);
  }, [shop.id]);

  const saveOne = async (productId) => {
    try {
      await api.put(`/inventory/${productId}`, { availableQuantity: Number(draft[productId] ?? 0) });
      setRows((prev) => prev.map((r) => (r.id === productId ? { ...r, stock: Number(draft[productId]) } : r)));
    } catch (e) {
      setError(e);
    }
  };

  const saveAll = async () => {
    setSaving(true);
    setError(null);
    try {
      const ids = Object.keys(draft);
      for (const id of ids) {
        await api.put(`/inventory/${id}`, { availableQuantity: Number(draft[id]) });
      }
      setRows((prev) =>
        prev.map((r) => (draft[r.id] != null ? { ...r, stock: Number(draft[r.id]) } : r))
      );
      setDraft({});
    } catch (e) {
      setError(e);
    } finally {
      setSaving(false);
    }
  };

  if (!rows) return <Loading />;

  const dirty = Object.keys(draft).length;

  return (
    <div className="admin-card">
      <ErrorBanner error={error} />
      <div className="panel-title">
        <h2>Tồn kho bán</h2>
        {dirty > 0 && (
          <button type="button" className="btn btn-sm" disabled={saving} onClick={saveAll}>
            {saving ? "Đang lưu…" : `Lưu ${dirty} thay đổi`}
          </button>
        )}
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Sản phẩm</th>
            <th className="num">Hiện tại</th>
            <th className="num">Cập nhật</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>
                {r.name}
                <small className="muted"> #{r.id}</small>
              </td>
              <td className={`num ${r.stock <= 5 ? "stock-low" : ""}`}>{r.stock}</td>
              <td className="num">
                <input
                  className="inline-qty"
                  type="number"
                  min="0"
                  defaultValue={r.stock}
                  onChange={(e) => setDraft({ ...draft, [r.id]: e.target.value })}
                />
              </td>
              <td>
                <button type="button" className="btn btn-sm" onClick={() => saveOne(r.id)}>
                  Lưu
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
