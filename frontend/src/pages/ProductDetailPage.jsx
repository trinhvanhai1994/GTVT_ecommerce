import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { MessageConstant } from "../constants";
import api from "../services/api";
import { ErrorBanner, Loading } from "../components/Feedback";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { money, productImage } from "../utils/catalog";
import { savePendingCart } from "../utils/pendingCart";

export default function ProductDetailPage() {
  const { id } = useParams();
  const { isAuthenticated, isAdmin } = useAuth();
  const { refresh } = useCart() || {};
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    void api
      .get(`/products/${id}`)
      .then((res) => setProduct(res.data.data))
      .catch(setError)
      .finally(() => setLoading(false));
  }, [id]);

  const goLoginToBuy = () => {
    savePendingCart({ productId: Number(id), quantity: Number(qty) || 1 });
    navigate("/login", {
      state: {
        from: `/products/${id}`,
        intent: "cart",
        productName: product?.name
      }
    });
  };

  const addToCart = async () => {
    setError(null);
    setMsg("");
    if (!isAuthenticated) {
      goLoginToBuy();
      return;
    }
    try {
      await api.post("/cart/items", { productId: Number(id), quantity: Number(qty) });
      await refresh?.();
      setMsg("Đã thêm vào giỏ hàng.");
    } catch (err) {
      if (err.status === 401 || err.code === "UNAUTHORIZED") {
        goLoginToBuy();
        return;
      }
      setError(err);
    }
  };

  if (loading) return <Loading />;
  if (!product) {
    return <ErrorBanner error={error || { message: MessageConstant.PRODUCT_NOT_FOUND }} />;
  }

  return (
    <section className="detail-layout">
      <div className="detail-media">
        <img src={productImage(product)} alt={product.name} />
      </div>
      <div className="detail-info">
        <Link className="crumb" to="/products">
          ← Tất cả sản phẩm
        </Link>
        <p className="product-brand">{product.brand}</p>
        <h1>{product.name}</h1>
        <p className="price xl">{money(product.price)}</p>
        <p className="lede">{product.description}</p>
        <ErrorBanner error={error} />
        {msg && <div className="banner ok">{msg}</div>}
        {!isAdmin && (
          <div className="buy-box">
            <label>
              Số lượng
              <input type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} />
            </label>
            <button className="btn btn-lg" onClick={addToCart}>
              {isAuthenticated ? "Thêm vào giỏ" : "Đăng nhập để mua"}
            </button>
          </div>
        )}
        {!isAuthenticated && !isAdmin && (
          <p className="muted">Cần tài khoản khách để giữ giỏ hàng. Sau khi đăng nhập, sản phẩm sẽ được thêm tự động.</p>
        )}
        <ul className="bullets">
          <li>Kiểm tra tồn kho khi thanh toán</li>
          <li>Đổi trả trong 7 ngày nếu lỗi nhà sản xuất</li>
          <li>Giao hàng tiêu chuẩn 2–4 ngày</li>
        </ul>
      </div>
    </section>
  );
}
