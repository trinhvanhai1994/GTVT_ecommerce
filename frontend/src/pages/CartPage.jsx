import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { Empty, ErrorBanner, Loading } from "../components/Feedback";
import { useCart } from "../context/CartContext";
import { money, productImage } from "../utils/catalog";

export default function CartPage() {
  const { cart, setCart, refresh } = useCart();
  const [catalog, setCatalog] = useState({});
  const [shopNames, setShopNames] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void refresh().finally(() => setLoading(false));
  }, [refresh]);

  const items = cart?.items || [];

  useEffect(() => {
    items.forEach((item) => {
      if (!catalog[item.productId]) {
        api
          .get(`/products/${item.productId}`)
          .then((res) => setCatalog((prev) => ({ ...prev, [item.productId]: res.data.data })))
          .catch(() => {});
      }
      if (item.shopId && !shopNames[item.shopId]) {
        api
          .get(`/shops/id/${item.shopId}`)
          .then((res) => setShopNames((prev) => ({ ...prev, [item.shopId]: res.data.data?.name || "Gian hàng" })))
          .catch(() => setShopNames((prev) => ({ ...prev, [item.shopId]: "Gian hàng" })));
      }
    });
  }, [items]);

  const groups = useMemo(() => {
    const map = new Map();
    items.forEach((i) => {
      const key = i.shopId || "unknown";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(i);
    });
    return [...map.entries()];
  }, [items]);

  const update = async (id, quantity) => {
    try {
      const { data } = await api.put(`/cart/items/${id}`, { quantity: Number(quantity) });
      setCart(data.data);
    } catch (err) {
      setError(err);
    }
  };

  const remove = async (id) => {
    const { data } = await api.delete(`/cart/items/${id}`);
    setCart(data.data);
  };

  const clear = async () => {
    const { data } = await api.delete("/cart");
    setCart(data.data);
  };

  if (loading) return <Loading />;

  const linesFor = (groupItems) =>
    groupItems.map((i) => {
      const p = catalog[i.productId];
      const unit = Number(p?.price || 0);
      return { ...i, product: p, line: unit * i.quantity };
    });
  const total = items.reduce((s, i) => s + Number(catalog[i.productId]?.price || 0) * i.quantity, 0);

  return (
    <section className="split">
      <div>
        <div className="page-title">
          <h1>Giỏ hàng</h1>
          <p className="muted">
            {items.length} sản phẩm · {groups.length} gian hàng
          </p>
        </div>
        <ErrorBanner error={error} />
        {items.length === 0 && (
          <Empty title="Giỏ hàng trống" text="Chọn cửa hàng và thêm sản phẩm để bắt đầu mua sắm." action={<Link className="btn" to="/">Chọn cửa hàng</Link>} />
        )}
        {groups.map(([shopId, groupItems]) => {
          const lines = linesFor(groupItems);
          return (
            <div key={shopId} className="cart-shop-block">
              <h2 className="cart-shop-title">{shopNames[shopId] || "Gian hàng"}</h2>
              <ul className="cart-list">
                {lines.map((i) => (
                  <li key={i.id} className="cart-line">
                    <img src={productImage(i.product || { id: i.productId })} alt="" />
                    <div>
                      <h3>{i.product?.name || "Sản phẩm"}</h3>
                      <p className="muted">{i.product?.brand}</p>
                      <p className="price">{i.product ? money(i.line) : "—"}</p>
                    </div>
                    <div className="qty-box">
                      <input type="number" min="1" value={i.quantity} onChange={(e) => update(i.id, e.target.value)} />
                      <button className="linkish" onClick={() => remove(i.id)}>
                        Xóa
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      {items.length > 0 && (
        <aside className="summary-card">
          <h2>Tóm tắt</h2>
          <p className="summary-row">
            <span>Tạm tính</span>
            <strong>{money(total)}</strong>
          </p>
          <p className="muted">Mỗi gian hàng sẽ tạo một đơn hàng riêng khi thanh toán.</p>
          <Link className="btn btn-lg" to="/checkout">
            Thanh toán
          </Link>
          <button className="btn btn-ghost" onClick={clear}>
            Xóa giỏ
          </button>
        </aside>
      )}
    </section>
  );
}
