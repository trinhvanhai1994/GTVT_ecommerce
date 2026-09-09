import { useEffect, useState, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import ProductCard from "../components/ProductCard.jsx";
import { getNormalizedPrice, money, productImage, TECH_FALLBACK_PRODUCTS } from "../utils/catalog";

const BRANDS = [
  { name: "Apple", badge: "Authorized Reseller", desc: "MacBook Pro, Air M4, iPhone & AirPods", logo: "https://cdn.simpleicons.org/apple/000000" },
  { name: "ASUS", badge: "ROG & Zenbook", desc: "Zenbook 14 OLED, ROG Strix & Màn hình ProArt", logo: "https://cdn.simpleicons.org/asus/00539B" },
  { name: "Samsung", badge: "Flagship Partner", desc: "Galaxy S24 Ultra, Z Fold & Màn hình Odyssey", logo: "https://cdn.simpleicons.org/samsung/1428A0" },
  { name: "Dell", badge: "Premier Partner", desc: "XPS 14 InfinityEdge, Alienware & Precision", logo: "https://cdn.simpleicons.org/dell/0076CE" },
  { name: "Lenovo", badge: "Tier 1 Partner", desc: "ThinkPad X1 Carbon, Legion Pro & Yoga", logo: "https://cdn.simpleicons.org/lenovo/E2231A" },
  { name: "Sony", badge: "Master Dealer", desc: "Tai nghe chống ồn WH-1000XM5 & Audio Hi-Res", logo: "https://cdn.simpleicons.org/sony/000000" },
  { name: "HP", badge: "Official Partner", desc: "Spectre x360 xoay gập, Envy & Omen Gaming", logo: "https://cdn.simpleicons.org/hp/0096D6" },
  { name: "Google", badge: "Pixel Ecosystem", desc: "Pixel 9 Pro, Buds Pro & Google Tensor AI", logo: "https://cdn.simpleicons.org/google/4285F4" },
  { name: "NVIDIA", badge: "GeForce RTX Studio", desc: "Card đồ họa RTX 40 Series & Tensor AI Cores", logo: "https://cdn.simpleicons.org/nvidia/76B900" }
];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const navigate = useNavigate();
  const sliderRef = useRef(null);
  const flashRef = useRef(null);
  const [secLeft, setSecLeft] = useState(52365);

  useEffect(() => {
    const t = setInterval(() => setSecLeft((s) => (s > 0 ? s - 1 : 86399)), 1000);
    return () => clearInterval(t);
  }, []);

  const hrs = String(Math.floor(secLeft / 3600)).padStart(2, "0");
  const mins = String(Math.floor((secLeft % 3600) / 60)).padStart(2, "0");
  const secs = String(secLeft % 60).padStart(2, "0");

  useEffect(() => {
    api.get("/products", { params: { size: 8, status: "ACTIVE" } })
      .then((r) => setFeatured(r.data?.data?.content?.length ? r.data.data.content : TECH_FALLBACK_PRODUCTS))
      .catch(() => setFeatured(TECH_FALLBACK_PRODUCTS));
  }, []);

  const flashItems = useMemo(() => {
    const list = featured.length ? featured : TECH_FALLBACK_PRODUCTS;
    const presets = [{ s: 8, t: 10, d: "-18%" }, { s: 12, t: 15, d: "-25%" }, { s: 4, t: 6, d: "-15%" }, { s: 17, t: 20, d: "-30%" }];
    return list.slice(0, 6).map((p, idx) => {
      const { s, t, d } = presets[idx % presets.length];
      const norm = getNormalizedPrice(p.price);
      const disc = parseInt(d.replace(/\D/g, "")) || 15;
      return { ...p, flashSalePrice: Math.round(norm * (1 - disc / 100)), flashOriginalPrice: norm, flashDiscount: d, soldCount: s, totalStock: t, soldProgress: Math.round((s / t) * 100) };
    });
  }, [featured]);

  const displayBrands = [...BRANDS, ...BRANDS];

  return (
    <div className="page">
      <div className="container">
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">LAPTOP AI 2026</div>
            <h1>Công nghệ mới.<br />Hiệu suất vượt trội.</h1>
            <p>Khám phá laptop AI mỏng nhẹ, gaming thế hệ mới và workstation đồ họa với giao hàng hỏa tốc 2H và bảo hành chính hãng 24 tháng.</p>
            <div className="hero-actions">
              <button className="btn primary" onClick={() => navigate("/products")}>
                <i className="fa-solid fa-bolt" style={{ marginRight: 4 }}></i> Khám phá sản phẩm
              </button>
              <button className="btn" style={{ background: "rgba(255,255,255,0.12)", color: "#fff", borderColor: "rgba(255,255,255,0.2)" }} onClick={() => navigate("/products?sale=true")}>
                Xem ưu đãi hot
              </button>
            </div>
          </div>
          <div className="hero-media">
            <img src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80" alt="Laptop AI" />
          </div>
        </section>

        <div style={{ marginTop: 36 }}>
          <div className="section-head">
            <h2 className="h2">Danh mục nổi bật</h2>
            <Link to="/products" className="link">Xem tất cả danh mục →</Link>
          </div>
          <div className="category-grid">
            <div className="category" onClick={() => navigate("/products?keyword=laptop")}>
              <strong>Laptop</strong><span className="small muted">Mỏng nhẹ · Gaming · AI</span>
            </div>
            <div className="category" onClick={() => navigate("/products?keyword=phone")}>
              <strong>Điện thoại</strong><span className="small muted">Android · iOS Flagship</span>
            </div>
            <div className="category" onClick={() => navigate("/products?keyword=audio")}>
              <strong>Âm thanh</strong><span className="small muted">Tai nghe ANC · Loa Hi-Res</span>
            </div>
            <div className="category" onClick={() => navigate("/products?keyword=gaming")}>
              <strong>Gaming Gear</strong><span className="small muted">Chuột · Bàn phím cơ · Màn hình</span>
            </div>
          </div>
        </div>

        <div className="trust-grid">
          <div className="trust">
            <strong><i className="fa-solid fa-shield-halved" style={{ marginRight: 6 }}></i> 100% Chính hãng</strong>
            <span className="small muted">Bảo hành 24 tháng toàn quốc</span>
          </div>
          <div className="trust">
            <strong><i className="fa-solid fa-truck-fast" style={{ marginRight: 6 }}></i> Giao hàng 2H</strong>
            <span className="small muted">Miễn phí giao hàng đơn từ 500k</span>
          </div>
          <div className="trust">
            <strong><i className="fa-solid fa-rotate-left" style={{ marginRight: 6 }}></i> 7 ngày đổi mới</strong>
            <span className="small muted">Lỗi phần cứng 1 đổi 1 tận nơi</span>
          </div>
          <div className="trust">
            <strong><i className="fa-solid fa-comments" style={{ marginRight: 6 }}></i> Tư vấn 24/7</strong>
            <span className="small muted">So sánh cấu hình & tối ưu chi phí</span>
          </div>
        </div>

        <section className="flash-sale-section">
          <div className="flash-sale-header">
            <div className="flash-sale-title-wrap">
              <div className="flash-sale-badge"><i className="fa-solid fa-bolt"></i> <span>FLASH SALE</span></div>
              <div className="flash-sale-subtitle">Giá sốc chớp nhoáng · Giảm sâu đến 30% · Số lượng có hạn</div>
            </div>
            <div className="flash-sale-timer-wrap">
              <span className="timer-label">Thời gian còn lại</span>
              <div className="timer-digits">
                <div className="timer-box">{hrs}</div><span className="timer-sep">:</span>
                <div className="timer-box">{mins}</div><span className="timer-sep">:</span>
                <div className="timer-box">{secs}</div>
              </div>
            </div>
          </div>

          <div className="flash-sale-slider-container">
            <button type="button" className="flash-nav-btn left" onClick={() => flashRef.current?.scrollBy({ left: -260, behavior: "smooth" })}>
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <div className="flash-sale-track" ref={flashRef}>
              {flashItems.map((item) => (
                <div key={item.id} className="flash-card" onClick={() => navigate(`/products/${item.id}`)}>
                  <div className="flash-card-media">
                    <img src={productImage(item)} alt={item.name} loading="lazy" />
                    <span className="flash-badge-auth"><i className="fa-solid fa-certificate"></i> CHÍNH HÃNG</span>
                    <span className="flash-badge-percent">{item.flashDiscount}</span>
                  </div>
                  <div className="flash-card-body">
                    <h3 className="flash-card-title">{item.name}</h3>
                    <div className="flash-price-row">
                      <span className="flash-price">{money(item.flashSalePrice)}</span>
                      <span className="flash-old-price">{money(item.flashOriginalPrice)}</span>
                    </div>
                    <div className="flash-progress-wrap">
                      <div className="flash-progress-bar"><div className="flash-progress-fill" style={{ width: `${item.soldProgress}%` }}></div></div>
                      <span className="flash-sold-text"><i className="fa-solid fa-fire" style={{ color: "#ff3b5c", marginRight: 4 }}></i> Đã bán {item.soldCount}/{item.totalStock}</span>
                    </div>
                    <div className="flash-ship-tag"><span className="flash-2h-pill">⚡ 2H</span><span>Hà Nội, TP.HCM</span></div>
                  </div>
                </div>
              ))}
            </div>
            <button type="button" className="flash-nav-btn right" onClick={() => flashRef.current?.scrollBy({ left: 260, behavior: "smooth" })}>
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>

          <div className="flash-sale-footer">
            <button type="button" className="flash-view-all-btn" onClick={() => navigate("/products?sale=true")}>
              Xem tất cả <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </section>

        <div style={{ marginTop: 12 }}>
          <div className="section-head">
            <div>
              <h2 className="h2">Sản phẩm nổi bật</h2>
              <div className="small muted">Giá tốt độc quyền · Trả góp 0% · Giao nhanh 2H</div>
            </div>
            <Link to="/products" className="link">Xem toàn bộ sản phẩm →</Link>
          </div>
          <div className="product-grid home-products">
            {featured.slice(0, 8).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>

        <div className="brand-slider-section">
          <div className="brand-slider-head">
            <div>
              <h2 className="h2" style={{ marginBottom: 6 }}>Thương hiệu đồng hành</h2>
              <div className="small muted">Đối tác công nghệ hàng đầu phân phối chính hãng 100% tại Việt Nam</div>
            </div>
            <div className="brand-slider-nav">
              <button type="button" className="brand-slider-btn" onClick={() => sliderRef.current?.scrollBy({ left: -300, behavior: "smooth" })}>
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              <button type="button" className="brand-slider-btn" onClick={() => sliderRef.current?.scrollBy({ left: 300, behavior: "smooth" })}>
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          </div>
          <div className="brand-slider-track" ref={sliderRef}>
            {displayBrands.map((b, idx) => (
              <div key={`${b.name}-${idx}`} className="brand-slide-card" onClick={() => navigate(`/products?keyword=${encodeURIComponent(b.name)}`)}>
                <div className="brand-card-header"><span className="brand-badge-pill">{b.badge}</span></div>
                <div className="brand-logo-wrap">
                  <img src={b.logo} alt="" className="brand-big-logo" loading="lazy" />
                </div>
                <div className="brand-card-info">
                  <h3 className="brand-card-name">{b.name}</h3>
                  <p className="brand-card-desc">{b.desc}</p>
                </div>
                <div className="brand-card-link">Khám phá sản phẩm <i className="fa-solid fa-arrow-right"></i></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
