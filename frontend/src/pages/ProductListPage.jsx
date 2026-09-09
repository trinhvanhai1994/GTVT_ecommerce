import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import ProductCard from "../components/ProductCard.jsx";
import { Empty, ErrorBanner, Loading } from "../components/Feedback";
import { getNormalizedPrice, TECH_FALLBACK_PRODUCTS } from "../utils/catalog";

const SORT_OPTIONS = [
  { value: "bestseller", label: "Bán chạy nhất", icon: "fa-fire" },
  { value: "price_asc", label: "Giá tăng dần", icon: "fa-arrow-up-wide-short" },
  { value: "price_desc", label: "Giá giảm dần", icon: "fa-arrow-down-wide-short" }
];

const PRICE_RANGES = [
  { id: "under20", label: "Dưới 20 triệu", match: (p) => p < 20000000 },
  { id: "20to30", label: "Từ 20 - 30 triệu", match: (p) => p >= 20000000 && p <= 30000000 },
  { id: "over30", label: "Trên 30 triệu", match: (p) => p > 30000000 }
];

const USAGE_NEEDS = [
  { id: "office", label: "Văn phòng & Học tập", kw: "office" },
  { id: "gaming", label: "Gaming & Đồ họa", kw: "gaming" },
  { id: "portable", label: "Mỏng nhẹ di động", kw: "mỏng" },
  { id: "tech", label: "Lập trình & Kỹ thuật", kw: "pro" }
];

export default function ProductListPage() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState(params.get("keyword") || "");
  const [brand, setBrand] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [need, setNeed] = useState("");
  const [sortBy, setSortBy] = useState("bestseller");
  const [sortOpen, setSortOpen] = useState(false);
  const [collapsed, setCollapsed] = useState({});

  const page = Number(params.get("page") || 0);

  useEffect(() => {
    setKeyword(params.get("keyword") || "");
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [params]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.get("/products", { params: { keyword: params.get("keyword") || undefined, page, size: 12, status: "ACTIVE" } })
      .then((res) => setProducts(res.data?.data?.content?.length ? res.data.data.content : TECH_FALLBACK_PRODUCTS))
      .catch(() => setProducts(TECH_FALLBACK_PRODUCTS))
      .finally(() => setLoading(false));
  }, [params, page]);

  const brands = useMemo(() => {
    const set = new Set(products.map((p) => p.brand?.trim()).filter(Boolean));
    ["Apple", "ASUS", "Dell", "Lenovo", "HP", "Sony"].forEach((b) => set.add(b));
    return Array.from(set);
  }, [products]);

  const filtered = useMemo(() => {
    let list = [...products];
    const q = (params.get("keyword") || keyword).trim().toLowerCase();
    if (q) list = list.filter((p) => (p.name + " " + (p.brand || "") + " " + (p.description || "")).toLowerCase().includes(q));
    if (brand) list = list.filter((p) => p.brand?.toLowerCase() === brand.toLowerCase());
    if (priceRange) {
      const match = PRICE_RANGES.find((r) => r.id === priceRange)?.match;
      if (match) list = list.filter((p) => match(getNormalizedPrice(p.price)));
    }
    if (need) {
      const kw = USAGE_NEEDS.find((n) => n.id === need)?.kw;
      if (kw) list = list.filter((p) => (p.name + " " + (p.category || "")).toLowerCase().includes(kw));
    }
    if (sortBy === "price_asc") list.sort((a, b) => getNormalizedPrice(a.price) - getNormalizedPrice(b.price));
    if (sortBy === "price_desc") list.sort((a, b) => getNormalizedPrice(b.price) - getNormalizedPrice(a.price));
    return list;
  }, [products, params, keyword, brand, priceRange, need, sortBy]);

  const clearFilters = () => { setBrand(""); setPriceRange(""); setNeed(""); setKeyword(""); setParams({}); };
  const currentSort = SORT_OPTIONS.find((s) => s.value === sortBy) || SORT_OPTIONS[0];

  return (
    <div className="page">
      <div className="container">
        <div className="listing-head">
          <div>
            <h1 className="h1">{params.get("sale") === "true" ? "Khuyến Mãi & Flash Sale" : "Thiết Bị Công Nghệ"}</h1>
            <div className="muted" style={{ marginTop: 6 }}>{filtered.length} sản phẩm · Chính hãng, bảo hành toàn diện, giao nhanh 2H</div>
          </div>
          <div className="toolbar">
            <form onSubmit={(e) => { e.preventDefault(); const n = new URLSearchParams(params); keyword ? n.set("keyword", keyword) : n.delete("keyword"); n.set("page", "0"); setParams(n); }} className="input-inline">
              <i className="fa-solid fa-magnifying-glass" style={{ color: "var(--muted)" }}></i>
              <input placeholder="Tìm MacBook, gaming, AI..." value={keyword} onChange={(e) => setKeyword(e.target.value)} />
            </form>
            <div className="custom-sort-dropdown" onMouseLeave={() => setSortOpen(false)}>
              <button type="button" className="custom-sort-trigger" onClick={() => setSortOpen((o) => !o)}>
                <i className={`fa-solid ${currentSort.icon}`} style={{ color: "var(--blue)" }}></i>
                <span>{currentSort.label}</span>
                <i className="fa-solid fa-chevron-down" style={{ fontSize: 11, color: "var(--muted)" }}></i>
              </button>
              {sortOpen && (
                <div className="custom-sort-menu">
                  {SORT_OPTIONS.map((opt) => (
                    <div key={opt.value} className={`custom-sort-item ${sortBy === opt.value ? "active" : ""}`} onClick={() => { setSortBy(opt.value); setSortOpen(false); }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <i className={`fa-solid ${opt.icon}`} style={{ width: 16, color: sortBy === opt.value ? "var(--blue)" : "var(--muted)" }}></i>
                        {opt.label}
                      </span>
                      {sortBy === opt.value && <i className="fa-solid fa-check" style={{ color: "var(--blue)", fontSize: 12 }}></i>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="listing-layout">
          <aside className="filters">
            <div className="filter-card-header">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <i className="fa-solid fa-sliders" style={{ color: "var(--blue)" }}></i>
                <strong style={{ fontSize: 15 }}>Bộ lọc</strong>
              </div>
              {(brand || priceRange || need || keyword) && (
                <button type="button" className="filter-clear-btn" onClick={clearFilters}><i className="fa-solid fa-rotate-left"></i> Xóa lọc</button>
              )}
            </div>

            {/* Brands */}
            <div className="filter-group">
              <div className="filter-group-header" onClick={() => setCollapsed((c) => ({ ...c, brand: !c.brand }))}>
                <span>THƯƠNG HIỆU</span><i className={`fa-solid fa-chevron-${collapsed.brand ? "down" : "up"} filter-chevron`}></i>
              </div>
              {!collapsed.brand && (
                <div className="filter-group-body">
                  {brands.map((b) => (
                    <div key={b} className={`filter-row ${brand === b ? "active" : ""}`} onClick={() => setBrand(brand === b ? "" : b)}>
                      <div className="filter-checkbox">{brand === b && <i className="fa-solid fa-check"></i>}</div>
                      <span className="filter-label">{b}</span>
                      <span className="filter-count">{products.filter((p) => p.brand?.toLowerCase() === b.toLowerCase()).length || 1}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Price Ranges */}
            <div className="filter-group">
              <div className="filter-group-header" onClick={() => setCollapsed((c) => ({ ...c, price: !c.price }))}>
                <span>MỨC GIÁ</span><i className={`fa-solid fa-chevron-${collapsed.price ? "down" : "up"} filter-chevron`}></i>
              </div>
              {!collapsed.price && (
                <div className="filter-group-body">
                  {PRICE_RANGES.map((p) => (
                    <div key={p.id} className={`filter-row ${priceRange === p.id ? "active" : ""}`} onClick={() => setPriceRange(priceRange === p.id ? "" : p.id)}>
                      <div className="filter-radio">{priceRange === p.id && <span className="filter-radio-dot" />}</div>
                      <span className="filter-label">{p.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Usage Needs */}
            <div className="filter-group">
              <div className="filter-group-header" onClick={() => setCollapsed((c) => ({ ...c, need: !c.need }))}>
                <span>NHU CẦU</span><i className={`fa-solid fa-chevron-${collapsed.need ? "down" : "up"} filter-chevron`}></i>
              </div>
              {!collapsed.need && (
                <div className="filter-group-body">
                  {USAGE_NEEDS.map((n) => (
                    <div key={n.id} className={`filter-row ${need === n.id ? "active" : ""}`} onClick={() => setNeed(need === n.id ? "" : n.id)}>
                      <div className="filter-checkbox">{need === n.id && <i className="fa-solid fa-check"></i>}</div>
                      <span className="filter-label">{n.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>

          <div>
            <ErrorBanner error={error} />
            {loading && <Loading />}
            {!loading && filtered.length === 0 && (
              <Empty title="Không tìm thấy sản phẩm" text="Không có sản phẩm nào phù hợp tiêu chí lọc." action={<button className="btn primary" onClick={clearFilters}>Xem tất cả sản phẩm</button>} />
            )}
            <div className="product-grid">
              {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
            {filtered.length > 0 && (
              <div className="pager">
                <button className="btn" disabled={page <= 0} onClick={() => { const n = new URLSearchParams(params); n.set("page", String(page - 1)); setParams(n); }}>
                  <i className="fa-solid fa-chevron-left"></i> Trang trước
                </button>
                <span className="small muted" style={{ fontWeight: 700 }}>Trang {page + 1}</span>
                <button className="btn" disabled={filtered.length < 12} onClick={() => { const n = new URLSearchParams(params); n.set("page", String(page + 1)); setParams(n); }}>
                  Trang sau <i className="fa-solid fa-chevron-right"></i>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
