import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { Empty, ErrorBanner, Loading } from "../components/Feedback";
import { useCart } from "../context/CartContext";
import { getNormalizedPrice, money, productImage, TECH_FALLBACK_PRODUCTS } from "../utils/catalog";

export default function CartPage() {
  const { cart, setCart, refresh } = useCart();
  const [catalog, setCatalog] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!cart?.items?.length) {
      setLoading(false);
      return;
    }
    const items = cart.items;
    let pending = items.length;
    items.forEach((item) => {
      api
        .get(`/products/${item.productId}`)
        .then((res) => {
          if (res.data?.data) {
            setCatalog((prev) => ({ ...prev, [item.productId]: res.data.data }));
          }
        })
        .catch(() => {
          const fallback =
            TECH_FALLBACK_PRODUCTS.find((p) => p.id === item.productId) ||
            TECH_FALLBACK_PRODUCTS[0];
          setCatalog((prev) => ({ ...prev, [item.productId]: fallback }));
        })
        .finally(() => {
          pending--;
          if (pending === 0) setLoading(false);
        });
    });
  }, [cart?.items]);

  const update = async (id, quantity) => {
    if (quantity < 1) return;
    try {
      const { data } = await api.put(`/cart/items/${id}`, { quantity: Number(quantity) });
      setCart(data.data);
    } catch (err) {
      setError(err);
    }
  };

  const remove = async (id) => {
    try {
      const { data } = await api.delete(`/cart/items/${id}`);
      setCart(data.data);
    } catch (err) {
      setError(err);
    }
  };

  const clear = async () => {
    try {
      const { data } = await api.delete("/cart");
      setCart(data.data);
    } catch (err) {
      setError(err);
    }
  };

  const items = cart?.items || [];
  if (loading) return <Loading />;

  const lines = items.map((i) => {
    const p =
      catalog[i.productId] ||
      TECH_FALLBACK_PRODUCTS.find((x) => x.id === i.productId) || {
        id: i.productId,
        name: `Sản phẩm #${i.productId}`,
        price: 28990000
      };
    const unit = getNormalizedPrice(p.price);
    return { ...i, product: p, line: unit * i.quantity };
  });

  const subtotal = lines.reduce((s, l) => s + l.line, 0);
  const discount = subtotal > 20000000 ? 1000000 : 0;
  const total = Math.max(0, subtotal - discount);

  return (
    <div className="page">
      <div className="container">
        <h1 className="h1">Giỏ hàng của bạn</h1>
        <p className="muted" style={{ marginBottom: "28px" }}>
          {items.length} sản phẩm đang sẵn sàng giao hàng hỏa tốc
        </p>

        <ErrorBanner error={error} />

        {items.length === 0 ? (
          <Empty
            title="Giỏ hàng đang trống"
            text="Bạn chưa thêm sản phẩm nào vào giỏ hàng. Hãy khám phá ngay các thiết bị công nghệ đỉnh cao tại NEXORA TECH."
            action={
              <Link className="btn primary" to="/products">
                <i className="fa-solid fa-arrow-left"></i> Khám phá sản phẩm ngay
              </Link>
            }
          />
        ) : (
          <div className="cart-layout">
            <div className="cart-list">
              {lines.map((i) => (
                <div key={i.id} className="card cart-item">
                  <div className="cart-img">
                    <img src={productImage(i.product)} alt={i.product?.name} />
                  </div>
                  <div>
                    <h3 className="h3">
                      <Link to={`/products/${i.productId}`} style={{ color: "inherit" }}>
                        {i.product?.name}
                      </Link>
                    </h3>
                    <div className="small muted">
                      {i.product?.brand || "Chính hãng"} · 16GB / 512GB · Bảo hành 24T
                    </div>
                    <div className="price">{money(i.product?.price)}</div>
                    <div className="qty">
                      <button onClick={() => update(i.id, i.quantity - 1)}>−</button>
                      <span>{i.quantity}</span>
                      <button onClick={() => update(i.id, i.quantity + 1)}>+</button>
                    </div>
                  </div>
                  <div className="cart-actions" style={{ textAlign: "right" }}>
                    <button className="btn danger" onClick={() => remove(i.id)}>
                      <i className="fa-solid fa-trash-can"></i> Xóa
                    </button>
                    <div className="small" style={{ color: "var(--green)", marginTop: "12px", fontWeight: "700" }}>
                      <i className="fa-solid fa-circle-check"></i> Còn hàng
                    </div>
                  </div>
                </div>
              ))}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
                <Link to="/products" className="link">
                  ← Tiếp tục xem sản phẩm khác
                </Link>
                <button
                  className="btn"
                  onClick={clear}
                  style={{ color: "var(--danger)", borderColor: "var(--danger-soft)" }}
                >
                  Xóa toàn bộ giỏ hàng
                </button>
              </div>
            </div>

            {/* Sticky Order Summary */}
            <aside className="summary">
              <h2 className="h2" style={{ marginBottom: "18px" }}>
                Tóm tắt đơn hàng
              </h2>
              <div className="summary-row">
                <span>Tạm tính ({items.length} món)</span>
                <strong>{money(subtotal)}</strong>
              </div>
              {discount > 0 && (
                <div className="summary-row" style={{ color: "var(--green)" }}>
                  <span>Khuyến mãi đặc quyền</span>
                  <strong>-{money(discount)}</strong>
                </div>
              )}
              <div className="summary-row">
                <span>Phí vận chuyển hỏa tốc</span>
                <strong style={{ color: "var(--green)" }}>Miễn phí 2H</strong>
              </div>
              <div className="summary-row total">
                <span>Tổng thanh toán</span>
                <span>{money(total)}</span>
              </div>

              <button
                className="btn primary"
                style={{ width: "100%", marginTop: "18px", minHeight: "50px", fontSize: "16px" }}
                onClick={() => navigate("/checkout")}
              >
                <i className="fa-solid fa-credit-card"></i>
                Tiến hành đặt hàng
              </button>
              <p className="small muted" style={{ marginTop: "14px", lineHeight: "1.5" }}>
                Đã bao gồm thuế giá trị gia tăng VAT 10%. Bảo hiểm vận chuyển 100% trong quá trình giao nhận hàng.
              </p>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
