import { useEffect, useState, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import ProductCard from "../components/ProductCard.jsx";
import { getNormalizedPrice, money, productImage, TECH_FALLBACK_PRODUCTS } from "../utils/catalog";

const PARTNER_BRANDS = [
  {
    name: "Apple",
    badge: "Authorized Reseller",
    desc: "MacBook Pro, Air M4, iPhone 15 & AirPods",
    logo: "https://cdn.simpleicons.org/apple/000000",
    keyword: "Apple"
  },
  {
    name: "ASUS",
    badge: "ROG & Zenbook",
    desc: "Zenbook 14 OLED, ROG Strix & Màn hình ProArt",
    logo: "https://cdn.simpleicons.org/asus/00539B",
    keyword: "ASUS"
  },
  {
    name: "Samsung",
    badge: "Flagship Partner",
    desc: "Galaxy S24 Ultra, Z Fold & Màn hình Odyssey",
    logo: "https://cdn.simpleicons.org/samsung/1428A0",
    keyword: "Samsung"
  },
  {
    name: "Dell",
    badge: "Premier Partner",
    desc: "XPS 14 InfinityEdge, Alienware & Precision",
    logo: "https://cdn.simpleicons.org/dell/0076CE",
    keyword: "Dell"
  },
  {
    name: "Lenovo",
    badge: "Tier 1 Partner",
    desc: "ThinkPad X1 Carbon, Legion Pro & Yoga 2-in-1",
    logo: "https://cdn.simpleicons.org/lenovo/E2231A",
    keyword: "Lenovo"
  },
  {
    name: "Sony",
    badge: "Master Dealer",
    desc: "Tai nghe chống ồn WH-1000XM5 & Audio Hi-Res",
    logo: "https://cdn.simpleicons.org/sony/000000",
    keyword: "Sony"
  },
  {
    name: "HP",
    badge: "Official Partner",
    desc: "Spectre x360 xoay gập, Envy & Omen Gaming",
    logo: "https://cdn.simpleicons.org/hp/0096D6",
    keyword: "HP"
  },
  {
    name: "Google",
    badge: "Pixel Ecosystem",
    desc: "Pixel 9 Pro, Buds Pro & Google Tensor AI",
    logo: "https://cdn.simpleicons.org/google/4285F4",
    keyword: "Google"
  },
  {
    name: "Acer",
    badge: "Predator & Swift",
    desc: "Predator Helios, Nitro & Swift Go siêu nhẹ",
    logo: "https://cdn.simpleicons.org/acer/83B81A",
    keyword: "Acer"
  },
  {
    name: "Intel",
    badge: "Core Ultra Inside",
    desc: "Vi xử lý Intel Core Ultra tích hợp NPU AI",
    logo: "https://cdn.simpleicons.org/intel/0071C5",
    keyword: "Intel"
  },
  {
    name: "NVIDIA",
    badge: "GeForce RTX Studio",
    desc: "Card đồ họa RTX 40 Series & Tensor AI Cores",
    logo: "https://cdn.simpleicons.org/nvidia/76B900",
    keyword: "Nvidia"
  }
];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const sliderRef = useRef(null);
  const isPausedRef = useRef(false);
  const scrollPosRef = useRef(0);

  // Auto-slide animation
  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;

    let frameId;
    const speed = 0.5; // Smooth, gentle auto-scroll speed (px/frame)

    const step = () => {
      if (!isPausedRef.current && el) {
        scrollPosRef.current += speed;
        // Seamless loop when reaching midpoint of duplicated list
        if (scrollPosRef.current >= el.scrollWidth / 2) {
          scrollPosRef.current = 0;
        }
        el.scrollLeft = scrollPosRef.current;
      } else if (el) {
        scrollPosRef.current = el.scrollLeft;
      }
      frameId = requestAnimationFrame(step);
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, []);

  const scrollBrands = (offset) => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: offset, behavior: "smooth" });
      setTimeout(() => {
        if (sliderRef.current) {
          scrollPosRef.current = sliderRef.current.scrollLeft;
        }
      }, 350);
    }
  };

  // Flash Sale State & Countdown Timer
  const flashRef = useRef(null);
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        }
        if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        }
        if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const scrollFlash = (offset) => {
    if (flashRef.current) {
      flashRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  const flashSaleItems = useMemo(() => {
    const source = featured.length > 0 ? featured : TECH_FALLBACK_PRODUCTS;
    const presets = [
      { sold: 8, total: 10, discount: "-18%" },
      { sold: 12, total: 15, discount: "-25%" },
      { sold: 4, total: 6, discount: "-15%" },
      { sold: 17, total: 20, discount: "-30%" },
      { sold: 9, total: 12, discount: "-20%" },
      { sold: 14, total: 16, discount: "-22%" }
    ];
    return source.slice(0, 6).map((p, idx) => {
      const preset = presets[idx % presets.length];
      const normPrice = getNormalizedPrice(p.price);
      const discountNum = parseInt(preset.discount.replace("-", "").replace("%", ""), 10) || 15;
      const flashPrice = Math.round(normPrice * (1 - discountNum / 100));
      return {
        ...p,
        flashSalePrice: flashPrice,
        flashOriginalPrice: normPrice,
        flashDiscount: preset.discount,
        soldCount: preset.sold,
        totalStock: preset.total,
        soldProgress: Math.round((preset.sold / preset.total) * 100)
      };
    });
  }, [featured]);

  useEffect(() => {
    api
      .get("/products", { params: { size: 8, status: "ACTIVE" } })
      .then((r) => {
        const items = r.data?.data?.content || [];
        if (items.length > 0) {
          setFeatured(items);
        } else {
          setFeatured(TECH_FALLBACK_PRODUCTS);
        }
      })
      .catch(() => {
        setFeatured(TECH_FALLBACK_PRODUCTS);
      })
      .finally(() => setLoading(false));
  }, []);

  // Duplicate the list once for seamless infinite loop
  const displayBrands = [...PARTNER_BRANDS, ...PARTNER_BRANDS];

  return (
    <div className="page">
      <div className="container">
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">LAPTOP AI 2026</div>
            <h1>
              Công nghệ mới.
              <br />
              Hiệu suất vượt trội.
            </h1>
            <p>
              Khám phá laptop AI mỏng nhẹ, gaming thế hệ mới và workstation đồ họa với giao hàng hỏa tốc 2H và bảo hành
              chính hãng 24 tháng.
            </p>
            <div className="hero-actions">
              <button className="btn primary" onClick={() => navigate("/products")}>
                <i className="fa-solid fa-bolt" style={{ marginRight: "4px" }}></i>
                Khám phá sản phẩm
              </button>
              <button
                className="btn"
                style={{ background: "rgba(255,255,255,0.12)", color: "#fff", borderColor: "rgba(255,255,255,0.2)" }}
                onClick={() => navigate("/products?sale=true")}
              >
                Xem ưu đãi hot
              </button>
            </div>
          </div>
          <div className="hero-media">
            <img
              src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80"
              alt="Laptop AI 2026"
            />
          </div>
        </section>

        {/* Categories Section */}
        <div style={{ marginTop: "36px" }}>
          <div className="section-head">
            <h2 className="h2">Danh mục nổi bật</h2>
            <Link to="/products" className="link">
              Xem tất cả danh mục →
            </Link>
          </div>
          <div className="category-grid">
            <div className="category" onClick={() => navigate("/products?keyword=laptop")}>
              <strong>Laptop</strong>
              <span className="small muted">Mỏng nhẹ · Gaming · AI</span>
            </div>
            <div className="category" onClick={() => navigate("/products?keyword=phone")}>
              <strong>Điện thoại</strong>
              <span className="small muted">Android · iOS Flagship</span>
            </div>
            <div className="category" onClick={() => navigate("/products?keyword=audio")}>
              <strong>Audio</strong>
              <span className="small muted">Tai nghe chống ồn · Loa</span>
            </div>
            <div className="category" onClick={() => navigate("/products?keyword=gaming")}>
              <strong>Gaming Gear</strong>
              <span className="small muted">Bàn phím cơ · Chuột · Màn</span>
            </div>
            <div className="category" onClick={() => navigate("/products?keyword=accessory")}>
              <strong>Phụ kiện</strong>
              <span className="small muted">Sạc nhanh · Hub · SSD</span>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="trust-grid">
          <div className="trust">
            <strong>
              <i className="fa-solid fa-truck-fast" style={{ marginRight: "6px" }}></i>
              Giao nhanh 2H
            </strong>
            <span className="small muted">Miễn phí nội thành HN & TP.HCM</span>
          </div>
          <div className="trust">
            <strong>
              <i className="fa-solid fa-shield-halved" style={{ marginRight: "6px" }}></i>
              Hàng chính hãng 100%
            </strong>
            <span className="small muted">Đầy đủ VAT & Nguồn gốc rõ ràng</span>
          </div>
          <div className="trust">
            <strong>
              <i className="fa-solid fa-rotate-left" style={{ marginRight: "6px" }}></i>
              Lỗi 1 đổi 1 trong 7 ngày
            </strong>
            <span className="small muted">Bảo hành tiêu chuẩn 12 – 24 tháng</span>
          </div>
          <div className="trust">
            <strong>
              <i className="fa-solid fa-comments" style={{ marginRight: "6px" }}></i>
              Tư vấn công nghệ 24/7
            </strong>
            <span className="small muted">So sánh cấu hình & Tối ưu ngân sách</span>
          </div>
        </div>

        {/* Flash Sale Section */}
        <section className="flash-sale-section">
          {/* Header: Title + Countdown */}
          <div className="flash-sale-header">
            <div className="flash-sale-title-wrap">
              <div className="flash-sale-badge">
                <i className="fa-solid fa-bolt"></i>
                <span>FLASH SALE</span>
              </div>
              <div className="flash-sale-subtitle">
                Giá sốc chớp nhoáng · Giảm sâu đến 30% · Số lượng có hạn
              </div>
            </div>

            <div className="flash-sale-timer-wrap">
              <span className="timer-label">Thời gian còn lại</span>
              <div className="timer-digits">
                <div className="timer-box">{String(timeLeft.hours).padStart(2, "0")}</div>
                <span className="timer-sep">:</span>
                <div className="timer-box">{String(timeLeft.minutes).padStart(2, "0")}</div>
                <span className="timer-sep">:</span>
                <div className="timer-box">{String(timeLeft.seconds).padStart(2, "0")}</div>
              </div>
            </div>
          </div>

          {/* Product Track with Carousel Navigation */}
          <div className="flash-sale-slider-container">
            <button
              type="button"
              className="flash-nav-btn left"
              onClick={() => scrollFlash(-260)}
              title="Trước đó"
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>

            <div className="flash-sale-track" ref={flashRef}>
              {flashSaleItems.map((item) => (
                <div
                  key={item.id}
                  className="flash-card"
                  onClick={() => navigate(`/products/${item.id}`)}
                >
                  <div className="flash-card-media">
                    <img
                      src={productImage(item)}
                      alt={item.name}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80";
                      }}
                    />
                    <span className="flash-badge-auth">
                      <i className="fa-solid fa-certificate"></i> CHÍNH HÃNG
                    </span>
                    <span className="flash-badge-percent">{item.flashDiscount}</span>
                  </div>

                  <div className="flash-card-body">
                    <h3 className="flash-card-title">{item.name}</h3>

                    <div className="flash-price-row">
                      <span className="flash-price">{money(item.flashSalePrice)}</span>
                      <span className="flash-old-price">{money(item.flashOriginalPrice)}</span>
                    </div>

                    {/* Progress bar & Sold badge */}
                    <div className="flash-progress-wrap">
                      <div className="flash-progress-bar">
                        <div
                          className="flash-progress-fill"
                          style={{ width: `${item.soldProgress}%` }}
                        ></div>
                      </div>
                      <span className="flash-sold-text">
                        <i className="fa-solid fa-fire" style={{ color: "#ff3b5c", marginRight: "4px" }}></i>
                        Đã bán {item.soldCount}/{item.totalStock}
                      </span>
                    </div>

                    {/* Shipping Tag */}
                    <div className="flash-ship-tag">
                      <span className="flash-2h-pill">⚡ 2H</span>
                      <span>Hà Nội, TP.HCM</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="flash-nav-btn right"
              onClick={() => scrollFlash(260)}
              title="Tiếp theo"
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>

          {/* View All Footer Button */}
          <div className="flash-sale-footer">
            <button
              type="button"
              className="flash-view-all-btn"
              onClick={() => navigate("/products?sale=true")}
            >
              Xem tất cả <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </section>

        {/* Featured Products */}
        <div style={{ marginTop: "12px" }}>
          <div className="section-head">
            <div>
              <h2 className="h2">Sản phẩm nổi bật</h2>
              <div className="small muted">Giá tốt độc quyền · Trả góp 0% · Giao nhanh 2H</div>
            </div>
            <Link to="/products" className="link">
              Xem toàn bộ sản phẩm →
            </Link>
          </div>

          <div className="product-grid home-products">
            {featured.slice(0, 8).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>

        {/* Auto-sliding Brand Cards Section */}
        <div className="brand-slider-section">
          <div className="brand-slider-head">
            <div>
              <h2 className="h2" style={{ marginBottom: "6px" }}>
                Thương hiệu đồng hành
              </h2>
              <div className="small muted">
                Hệ sinh thái đối tác công nghệ hàng đầu phân phối chính hãng 100% tại Việt Nam
              </div>
            </div>
            <div className="brand-slider-nav">
              <button
                type="button"
                className="brand-slider-btn"
                onClick={() => scrollBrands(-300)}
                title="Trước đó"
              >
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              <button
                type="button"
                className="brand-slider-btn"
                onClick={() => scrollBrands(300)}
                title="Tiếp theo"
              >
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          </div>

          <div
            className="brand-slider-track"
            ref={sliderRef}
            onMouseEnter={() => {
              isPausedRef.current = true;
            }}
            onMouseLeave={() => {
              isPausedRef.current = false;
            }}
            onTouchStart={() => {
              isPausedRef.current = true;
            }}
            onTouchEnd={() => {
              isPausedRef.current = false;
            }}
          >
            {displayBrands.map((b, idx) => (
              <div
                key={`${b.keyword}-${idx}`}
                className="brand-slide-card"
                onClick={() => navigate(`/products?keyword=${encodeURIComponent(b.keyword)}`)}
              >
                <div className="brand-card-header">
                  <span className="brand-badge-pill">{b.badge}</span>
                </div>

                <div className="brand-logo-wrap">
                  <img
                    src={b.logo}
                    alt={`${b.name} logo`}
                    className="brand-big-logo"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>

                <div className="brand-card-info">
                  <h3 className="brand-card-name">{b.name}</h3>
                  <p className="brand-card-desc">{b.desc}</p>
                </div>

                <div className="brand-card-link">
                  Khám phá sản phẩm <i className="fa-solid fa-arrow-right"></i>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
