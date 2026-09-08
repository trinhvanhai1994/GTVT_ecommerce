import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { ErrorBanner, Loading } from "../components/Feedback";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { money, productImage, TECH_FALLBACK_PRODUCTS } from "../utils/catalog";
import { savePendingCart } from "../utils/pendingCart";
import ProductReviews from "../components/ProductReviews.jsx";

export default function ProductDetailPage() {
  const { id } = useParams();
  const { isAuthenticated, isAdmin } = useAuth();
  const { refresh } = useCart() || {};
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState("");
  const [selectedRam, setSelectedRam] = useState("16GB");
  const [selectedStorage, setSelectedStorage] = useState("512GB");
  const [selectedColor, setSelectedColor] = useState("Midnight");
  const [qty, setQty] = useState(1);
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/products/${id}`)
      .then((res) => {
        if (res.data?.data) {
          setProduct(res.data.data);
          setActiveImage(productImage(res.data.data));
        } else {
          fallbackLoad();
        }
      })
      .catch(() => {
        fallbackLoad();
      })
      .finally(() => setLoading(false));

    function fallbackLoad() {
      const match = TECH_FALLBACK_PRODUCTS.find((p) => String(p.id) === String(id));
      const fallbackItem = match || TECH_FALLBACK_PRODUCTS[0];
      setProduct(fallbackItem);
      setActiveImage(productImage(fallbackItem));
    }
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

  const addToCart = async (redirectCheckout = false) => {
    setError(null);
    setMsg("");
    if (!isAuthenticated) {
      goLoginToBuy();
      return;
    }
    try {
      await api.post("/cart/items", { productId: Number(id), quantity: Number(qty) });
      await refresh?.();
      if (redirectCheckout) {
        navigate("/cart");
      } else {
        setMsg("Đã thêm sản phẩm vào giỏ hàng thành công!");
      }
    } catch (err) {
      if (err.status === 401 || err.code === "UNAUTHORIZED") {
        goLoginToBuy();
        return;
      }
      setError(err);
    }
  };

  if (loading) return <Loading />;
  if (!product) return <ErrorBanner error={error || { message: "Không tìm thấy sản phẩm" }} />;

  const thumbs = [
    productImage(product),
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=900&q=80"
  ];

  return (
    <div className="page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="small muted" style={{ marginBottom: "20px" }}>
          <Link to="/" className="link" style={{ color: "inherit", fontWeight: "400" }}>
            Trang chủ
          </Link>{" "}
          /{" "}
          <Link to="/products" className="link" style={{ color: "inherit", fontWeight: "400" }}>
            {product.category || "Laptop"}
          </Link>{" "}
          / <span style={{ color: "var(--ink)", fontWeight: "600" }}>{product.name}</span>
        </div>

        {/* PDP Layout */}
        <div className="pdp-layout">
          {/* Gallery Media */}
          <div>
            <img
              className="pdp-main-img"
              src={activeImage || productImage(product)}
              alt={product.name}
            />
            <div className="thumbs">
              {thumbs.map((src, idx) => (
                <div
                  key={idx}
                  className={`thumb ${activeImage === src ? "active" : ""}`}
                  onClick={() => setActiveImage(src)}
                >
                  <img src={src} alt={`Thumbnail ${idx + 1}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Product Details Info */}
          <div>
            <div className="row" style={{ gap: "10px" }}>
              <span className="chip">HÀNG CHÍNH HÃNG 100%</span>
              <span className="small muted">Mã SKU: {product.sku || `NX-${product.id}`}</span>
            </div>

            <h1 className="pdp-title">{product.name}</h1>

            <div className="muted" style={{ display: "flex", alignItems: "center", gap: "8px", margin: "8px 0" }}>
              <span style={{ color: "#f59e0b", fontSize: "16px" }}>★★★★★</span>
              <span style={{ fontWeight: "700", color: "var(--ink)" }}>4.9</span>
              <a
                href="#reviews-section"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("reviews-section")?.scrollIntoView({ behavior: "smooth" });
                }}
                style={{ color: "var(--blue)", cursor: "pointer", textDecoration: "underline", fontWeight: "600", fontSize: "13px" }}
              >
                · 328 đánh giá thực tế
              </a>
            </div>

            <div className="row" style={{ gap: "16px", margin: "18px 0" }}>
              <div style={{ fontSize: "32px", color: "var(--blue)", fontWeight: "800" }}>
                {money(product.price)}
              </div>
              {product.originalPrice && (
                <div className="muted" style={{ fontSize: "18px", textDecoration: "line-through" }}>
                  {money(product.originalPrice)}
                </div>
              )}
              {product.sale && <span className="chip sale">{product.sale}</span>}
            </div>

            <div className="stock">
              <i className="fa-solid fa-truck-fast"></i>
              <span>Còn hàng · Giao nhanh 2H tại nội thành Hà Nội & TP.HCM</span>
            </div>

            <div className="two-col">
              <div className="field">
                <label>Tình trạng máy</label>
                <div className="inputbox">Mới 100%, Nguyên seal box, Chính hãng</div>
              </div>
              <div className="field">
                <label>Thời hạn bảo hành</label>
                <div className="inputbox">24 tháng chính hãng toàn quốc</div>
              </div>
            </div>

            {/* Variant Options */}
            <div style={{ marginTop: "20px" }}>
              <div className="field">
                <label className="muted">Cấu hình RAM</label>
                <div className="variants">
                  {["16GB", "24GB", "32GB"].map((r) => (
                    <button
                      key={r}
                      className={`variant ${selectedRam === r ? "selected" : ""}`}
                      onClick={() => setSelectedRam(r)}
                    >
                      {r} Unified
                    </button>
                  ))}
                </div>
              </div>

              <div className="field">
                <label className="muted">Ổ cứng SSD</label>
                <div className="variants">
                  {["512GB", "1TB", "2TB"].map((s) => (
                    <button
                      key={s}
                      className={`variant ${selectedStorage === s ? "selected" : ""}`}
                      onClick={() => setSelectedStorage(s)}
                    >
                      {s} SSD NVMe
                    </button>
                  ))}
                </div>
              </div>

              <div className="field">
                <label className="muted">Màu sắc hoàn thiện</label>
                <div className="variants">
                  {["Midnight", "Starlight", "Space Gray"].map((c) => (
                    <button
                      key={c}
                      className={`variant ${selectedColor === c ? "selected" : ""}`}
                      onClick={() => setSelectedColor(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Promo Box */}
            <div className="promo">
              <strong style={{ color: "#92400e", fontSize: "14px", display: "block", marginBottom: "6px" }}>
                <i className="fa-solid fa-gift" style={{ marginRight: "6px" }}></i>
                Quà tặng & Ưu đãi đặc quyền tại NEXORA TECH
              </strong>
              • Giảm thêm 10% khi mua phụ kiện Hub / Cáp sạc kèm máy
              <br />
              • Hỗ trợ trả góp 0% qua thẻ tín dụng / Home PayLater
              <br />
              • Tặng gói cân màu màn hình & cài đặt bộ công cụ chuyên nghiệp
              <br />• Miễn phí giao hàng hỏa tốc trong 2 giờ
            </div>

            <ErrorBanner error={error} />
            {msg && <div className="banner ok" style={{ marginTop: "16px" }}>{msg}</div>}

            {/* CTAs */}
            {!isAdmin && (
              <div className="cta">
                <button className="btn primary" onClick={() => addToCart(true)}>
                  <i className="fa-solid fa-bolt"></i>
                  Mua ngay
                </button>
                <button className="btn" onClick={() => addToCart(false)}>
                  <i className="fa-solid fa-bag-shopping"></i>
                  Thêm vào giỏ hàng
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Technical Specifications */}
        <div className="specs">
          <h2 className="h2">Thông số kỹ thuật chi tiết</h2>
          <div className="spec-grid">
            <div>
              <div className="spec-row">
                <span className="muted small">Vi xử lý (CPU)</span>
                <strong>{product.specs?.Chip || "Apple M4 10-core (4P + 6E)"}</strong>
              </div>
              <div className="spec-row">
                <span className="muted small">Bộ nhớ RAM</span>
                <strong>{selectedRam} High Bandwidth Unified Memory</strong>
              </div>
              <div className="spec-row">
                <span className="muted small">Ổ cứng</span>
                <strong>{selectedStorage} PCIe SuperFast SSD</strong>
              </div>
              <div className="spec-row">
                <span className="muted small">Đồ họa (GPU)</span>
                <strong>10-core GPU with Hardware-accelerated ray tracing</strong>
              </div>
            </div>
            <div>
              <div className="spec-row">
                <span className="muted small">Màn hình</span>
                <strong>{product.specs?.Display || "13.6” Liquid Retina 500 nits True Tone"}</strong>
              </div>
              <div className="spec-row">
                <span className="muted small">Thời lượng pin</span>
                <strong>{product.specs?.Battery || "Lên đến 18 giờ phát video"}</strong>
              </div>
              <div className="spec-row">
                <span className="muted small">Trọng lượng</span>
                <strong>{product.specs?.Weight || "1.24 kg"}</strong>
              </div>
              <div className="spec-row">
                <span className="muted small">Hệ điều hành</span>
                <strong>macOS / Windows 11 Home Bản quyền</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Product Customer Reviews & Ratings */}
        <ProductReviews product={product} />
      </div>
    </div>
  );
}
