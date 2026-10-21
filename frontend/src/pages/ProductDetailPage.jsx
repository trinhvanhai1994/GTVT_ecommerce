import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { MessageConstant } from "../constants";
import api from "../services/api";
import { ErrorBanner, Loading } from "../components/Feedback";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { money, productImage } from "../utils/catalog";
import { savePendingCart } from "../utils/pendingCart";

export default function ProductDetailPage() {
  const { id, shopId: shopKey } = useParams();
  const { isAuthenticated, isPlatformAdmin, isSeller } = useAuth();
  const { refresh } = useCart() || {};
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [resolvedShopId, setResolvedShopId] = useState(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [myShopId, setMyShopId] = useState(null);

  const shopId =
    resolvedShopId ||
    (shopKey && /^\d+$/.test(String(shopKey)) ? shopKey : product?.shopId != null ? String(product.shopId) : null);
  const backHref = shopId ? `/shops/${shopId}` : "/";

  useEffect(() => {
    if (!isSeller) {
      setMyShopId(null);
      return;
    }
    api
      .get("/shops/me")
      .then((r) => setMyShopId(r.data.data?.id ?? null))
      .catch(() => setMyShopId(null));
  }, [isSeller]);

  useEffect(() => {
    setLoading(true);
    void api
      .get(`/products/${id}`)
      .then((res) => setProduct(res.data.data))
      .catch(setError)
      .finally(() => setLoading(false));
  }, [id]);

  // Legacy slug in URL → redirect to /shops/{id}/products/{productId}
  useEffect(() => {
    if (!shopKey || /^\d+$/.test(String(shopKey))) {
      setResolvedShopId(shopKey && /^\d+$/.test(String(shopKey)) ? String(shopKey) : null);
      return;
    }
    let cancelled = false;
    api
      .get(`/shops/${shopKey}`)
      .then((res) => {
        if (cancelled) return;
        const sid = res.data.data?.id;
        if (sid != null) {
          setResolvedShopId(String(sid));
          navigate(`/shops/${sid}/products/${id}`, { replace: true });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [shopKey, id, navigate]);

  const goLoginToBuy = () => {
    savePendingCart({ productId: Number(id), quantity: Number(qty) || 1 });
    navigate("/login", {
      state: {
        from: shopId ? `/shops/${shopId}/products/${id}` : `/products/${id}`,
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

  if (isSeller) {
    return <Navigate to="/seller/products" replace />;
  }

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
        <Link className="crumb" to={backHref}>
          ← {shopId ? "Quay lại cửa hàng" : "Về trang chủ"}
        </Link>
        <p className="product-brand">{product.brand}</p>
        <h1>{product.name}</h1>
        <p className="price xl">{money(product.price)}</p>
        <p className="lede">{product.description}</p>
        <ErrorBanner error={error} />
        {msg && <div className="banner ok">{msg}</div>}
        {isSeller && (
          <div className="banner">
            {shopId && myShopId != null && String(shopId) === String(myShopId) ? (
              <>
                Sản phẩm thuộc shop của bạn. Quản lý tại{" "}
                <Link to="/seller/products">Kênh người bán</Link>.
              </>
            ) : (
              <>
                Tài khoản người bán không mua hàng — dùng tài khoản khách để đặt hàng. Xem{" "}
                <Link to="/seller">Kênh người bán</Link>.
              </>
            )}
          </div>
        )}
        {!isPlatformAdmin && !isSeller && (
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
        {!isAuthenticated && !isPlatformAdmin && (
          <p className="muted">Đăng nhập để thêm vào giỏ và theo dõi đơn hàng. Sản phẩm sẽ được thêm tự động sau khi đăng nhập.</p>
        )}
        <ul className="bullets">
          <li>Cam kết hàng chính hãng từ gian hàng</li>
          <li>Đổi trả trong 7 ngày nếu lỗi nhà sản xuất</li>
          <li>Giao hàng tiêu chuẩn 2–4 ngày</li>
        </ul>
      </div>
    </section>
  );
}
