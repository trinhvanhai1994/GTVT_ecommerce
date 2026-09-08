import { useEffect, useState, useMemo, useRef } from "react";
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
  { id: "under20", label: "Dưới 20 triệu" },
  { id: "20to30", label: "Từ 20 – 30 triệu" },
  { id: "over30", label: "Trên 30 triệu" }
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
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState(params.get("keyword") || "");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedPriceRange, setSelectedPriceRange] = useState("");
  const [selectedNeed, setSelectedNeed] = useState("");
  const [sortBy, setSortBy] = useState("bestseller");
  const [sortOpen, setSortOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({
    brand: false,
    price: false,
    need: false
  });

  const sortDropdownRef = useRef(null);
  const page = Number(params.get("page") || 0);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target)) {
        setSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setKeyword(params.get("keyword") || "");
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [params]);

  useEffect(() => {
    api
      .get("/products/categories")
      .then((res) => setCategories(res.data.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .get("/products", {
        params: {
          keyword: params.get("keyword") || undefined,
          categoryId: params.get("categoryId") || undefined,
          page,
          size: 12,
          status: "ACTIVE"
        }
      })
      .then((res) => {
        const list = res.data?.data?.content || [];
        if (list.length > 0) {
          setProducts(list);
        } else {
          setProducts(TECH_FALLBACK_PRODUCTS);
        }
      })
      .catch(() => {
        setProducts(TECH_FALLBACK_PRODUCTS);
      })
      .finally(() => setLoading(false));
  }, [params, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(params);
    if (keyword.trim()) {
      next.set("keyword", keyword.trim());
    } else {
      next.delete("keyword");
    }
    next.set("page", "0");
    setParams(next);
  };

  const clearAllFilters = () => {
    setSelectedBrand("");
    setSelectedPriceRange("");
    setSelectedNeed("");
    setKeyword("");
    setParams({});
  };

  const hasActiveFilters = Boolean(
    selectedBrand || selectedPriceRange || selectedNeed || keyword || params.get("keyword")
  );

  // Dynamic available brands deduplicated case-insensitively
  const availableBrands = useMemo(() => {
    const canonicalNames = {
      asus: "ASUS",
      apple: "Apple",
      samsung: "Samsung",
      dell: "Dell",
      hp: "HP",
      lenovo: "Lenovo",
      sony: "Sony",
      google: "Google",
      anker: "Anker",
      spigen: "Spigen",
      tomtoc: "Tomtoc"
    };

    const brandMap = new Map();

    // From actual products
    products.forEach((p) => {
      if (p.brand && p.brand.trim()) {
        const key = p.brand.trim().toLowerCase();
        if (!brandMap.has(key)) {
          brandMap.set(key, canonicalNames[key] || p.brand.trim());
        }
      }
    });

    // Default major brands
    ["apple", "samsung", "asus", "dell", "lenovo", "hp", "sony"].forEach((k) => {
      if (!brandMap.has(k)) {
        brandMap.set(k, canonicalNames[k]);
      }
    });

    return Array.from(brandMap.values());
  }, [products]);

  // Faceted count for brand: takes active price range, need, and keyword into account
  const getBrandCount = (brandName) => {
    const bKey = brandName.toLowerCase();
    let pool = products;

    const q = (params.get("keyword") || keyword || "").toLowerCase();
    if (q) {
      pool = pool.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    if (selectedPriceRange === "under20") {
      pool = pool.filter((p) => getNormalizedPrice(p.price) < 20000000);
    } else if (selectedPriceRange === "20to30") {
      pool = pool.filter((p) => {
        const val = getNormalizedPrice(p.price);
        return val >= 20000000 && val <= 30000000;
      });
    } else if (selectedPriceRange === "over30") {
      pool = pool.filter((p) => getNormalizedPrice(p.price) > 30000000);
    }

    if (selectedNeed) {
      const needObj = USAGE_NEEDS.find((n) => n.id === selectedNeed);
      if (needObj) {
        const needle = needObj.kw.toLowerCase();
        pool = pool.filter(
          (p) =>
            p.name?.toLowerCase().includes(needle) ||
            p.description?.toLowerCase().includes(needle) ||
            p.category?.toLowerCase().includes(needle)
        );
      }
    }

    return pool.filter((p) => p.brand?.trim().toLowerCase() === bKey).length;
  };

  // Faceted count for price range: takes active brand, need, and keyword into account
  const getPriceRangeCount = (rangeId) => {
    let pool = products;

    const q = (params.get("keyword") || keyword || "").toLowerCase();
    if (q) {
      pool = pool.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    if (selectedBrand) {
      pool = pool.filter(
        (p) => p.brand && p.brand.trim().toLowerCase() === selectedBrand.trim().toLowerCase()
      );
    }

    if (selectedNeed) {
      const needObj = USAGE_NEEDS.find((n) => n.id === selectedNeed);
      if (needObj) {
        const needle = needObj.kw.toLowerCase();
        pool = pool.filter(
          (p) =>
            p.name?.toLowerCase().includes(needle) ||
            p.description?.toLowerCase().includes(needle) ||
            p.category?.toLowerCase().includes(needle)
        );
      }
    }

    if (rangeId === "under20") {
      return pool.filter((p) => getNormalizedPrice(p.price) < 20000000).length;
    }
    if (rangeId === "20to30") {
      return pool.filter((p) => {
        const val = getNormalizedPrice(p.price);
        return val >= 20000000 && val <= 30000000;
      }).length;
    }
    if (rangeId === "over30") {
      return pool.filter((p) => getNormalizedPrice(p.price) > 30000000).length;
    }
    return 0;
  };

  // Faceted count for usage need: takes active brand, price, and keyword into account
  const getNeedCount = (needId) => {
    let pool = products;

    const q = (params.get("keyword") || keyword || "").toLowerCase();
    if (q) {
      pool = pool.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    if (selectedBrand) {
      pool = pool.filter(
        (p) => p.brand && p.brand.trim().toLowerCase() === selectedBrand.trim().toLowerCase()
      );
    }

    if (selectedPriceRange === "under20") {
      pool = pool.filter((p) => getNormalizedPrice(p.price) < 20000000);
    } else if (selectedPriceRange === "20to30") {
      pool = pool.filter((p) => {
        const val = getNormalizedPrice(p.price);
        return val >= 20000000 && val <= 30000000;
      });
    } else if (selectedPriceRange === "over30") {
      pool = pool.filter((p) => getNormalizedPrice(p.price) > 30000000);
    }

    const needObj = USAGE_NEEDS.find((n) => n.id === needId);
    if (!needObj) return 0;
    const needle = needObj.kw.toLowerCase();
    return pool.filter(
      (p) =>
        p.name?.toLowerCase().includes(needle) ||
        p.description?.toLowerCase().includes(needle) ||
        p.category?.toLowerCase().includes(needle)
    ).length;
  };

  // Client-side filtering & sorting
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by keyword locally if needed
    const q = (params.get("keyword") || keyword || "").toLowerCase();
    if (q) {
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Filter by brand
    if (selectedBrand) {
      result = result.filter(
        (p) => p.brand && p.brand.trim().toLowerCase() === selectedBrand.trim().toLowerCase()
      );
    }

    // Filter by price range with normalized VND price
    if (selectedPriceRange === "under20") {
      result = result.filter((p) => getNormalizedPrice(p.price) < 20000000);
    } else if (selectedPriceRange === "20to30") {
      result = result.filter((p) => {
        const val = getNormalizedPrice(p.price);
        return val >= 20000000 && val <= 30000000;
      });
    } else if (selectedPriceRange === "over30") {
      result = result.filter((p) => getNormalizedPrice(p.price) > 30000000);
    }

    // Filter by usage need
    if (selectedNeed) {
      const needObj = USAGE_NEEDS.find((n) => n.id === selectedNeed);
      if (needObj) {
        const needle = needObj.kw.toLowerCase();
        result = result.filter(
          (p) =>
            p.name?.toLowerCase().includes(needle) ||
            p.description?.toLowerCase().includes(needle) ||
            p.category?.toLowerCase().includes(needle)
        );
      }
    }

    // Filter by sale if query param sale=true
    if (params.get("sale") === "true") {
      result = result.filter(
        (p) => p.sale || (p.originalPrice && Number(p.originalPrice) > Number(p.price))
      );
    }

    // Sort with normalized VND price
    if (sortBy === "price_asc") {
      result.sort((a, b) => getNormalizedPrice(a.price) - getNormalizedPrice(b.price));
    } else if (sortBy === "price_desc") {
      result.sort((a, b) => getNormalizedPrice(b.price) - getNormalizedPrice(a.price));
    }

    return result;
  }, [products, params, keyword, selectedBrand, selectedPriceRange, selectedNeed, sortBy]);

  const currentSort = SORT_OPTIONS.find((s) => s.value === sortBy) || SORT_OPTIONS[0];

  return (
    <div className="page">
      <div className="container">
        {/* Listing Head */}
        <div className="listing-head">
          <div>
            <h1 className="h1">
              {params.get("sale") === "true"
                ? "Sản Phẩm Khuyến Mãi & Flash Sale"
                : "Thiết Bị Công Nghệ & Điện Tử"}
            </h1>
            <div className="muted" style={{ marginTop: "6px" }}>
              {filteredProducts.length} sản phẩm · Chính hãng, bảo hành toàn diện, giao nhanh 2H
            </div>
          </div>

          <div className="toolbar">
            <form onSubmit={handleSearchSubmit} className="input-inline">
              <i className="fa-solid fa-magnifying-glass" style={{ color: "var(--muted)" }}></i>
              <input
                placeholder="Tìm MacBook, gaming, AI, tai nghe..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </form>
            <button className="btn primary" onClick={handleSearchSubmit}>
              Tìm kiếm
            </button>

            {/* Custom Styled Sort Dropdown */}
            <div className="custom-sort-dropdown" ref={sortDropdownRef}>
              <button
                type="button"
                className="custom-sort-trigger"
                onClick={() => setSortOpen((o) => !o)}
              >
                <i className={`fa-solid ${currentSort.icon}`} style={{ color: "var(--blue)" }}></i>
                <span>{currentSort.label}</span>
                <i
                  className="fa-solid fa-chevron-down"
                  style={{
                    fontSize: "11px",
                    color: "var(--muted)",
                    transform: sortOpen ? "rotate(180deg)" : "none",
                    transition: "transform 0.2s"
                  }}
                ></i>
              </button>

              {sortOpen && (
                <div className="custom-sort-menu">
                  {SORT_OPTIONS.map((opt) => (
                    <div
                      key={opt.value}
                      className={`custom-sort-item ${sortBy === opt.value ? "active" : ""}`}
                      onClick={() => {
                        setSortBy(opt.value);
                        setSortOpen(false);
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <i
                          className={`fa-solid ${opt.icon}`}
                          style={{
                            width: "16px",
                            textAlign: "center",
                            color: sortBy === opt.value ? "var(--blue)" : "var(--muted)"
                          }}
                        ></i>
                        {opt.label}
                      </span>
                      {sortBy === opt.value && (
                        <i className="fa-solid fa-check" style={{ color: "var(--blue)", fontSize: "12px" }}></i>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Listing Layout with Sidebar */}
        <div className="listing-layout">
          <aside className="filters">
            <div className="filter-card-header">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <i className="fa-solid fa-sliders" style={{ color: "var(--blue)" }}></i>
                <strong style={{ fontSize: "15px" }}>Bộ lọc chuyên sâu</strong>
              </div>
              {hasActiveFilters && (
                <button
                  type="button"
                  className="filter-clear-btn"
                  onClick={clearAllFilters}
                >
                  <i className="fa-solid fa-rotate-left"></i> Xóa lọc
                </button>
              )}
            </div>

            {/* Brand Group */}
            <div className="filter-group">
              <div
                className="filter-group-header"
                onClick={() => setCollapsedSections((s) => ({ ...s, brand: !s.brand }))}
              >
                <span>THƯƠNG HIỆU</span>
                <i className={`fa-solid fa-chevron-${collapsedSections.brand ? "down" : "up"} filter-chevron`}></i>
              </div>
              {!collapsedSections.brand && (
                <div className="filter-group-body">
                  {availableBrands.map((b) => {
                    const isSelected = selectedBrand.toLowerCase() === b.toLowerCase();
                    const count = getBrandCount(b);
                    return (
                      <div
                        key={b}
                        className={`filter-row ${isSelected ? "active" : ""} ${count === 0 && !isSelected ? "disabled" : ""}`}
                        onClick={() => setSelectedBrand(isSelected ? "" : b)}
                      >
                        <div className="filter-checkbox">
                          {isSelected && <i className="fa-solid fa-check"></i>}
                        </div>
                        <span className="filter-label">{b}</span>
                        <span className={`filter-count ${count === 0 ? "zero" : ""}`}>
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Price Range Group */}
            <div className="filter-group">
              <div
                className="filter-group-header"
                onClick={() => setCollapsedSections((s) => ({ ...s, price: !s.price }))}
              >
                <span>MỨC GIÁ</span>
                <i className={`fa-solid fa-chevron-${collapsedSections.price ? "down" : "up"} filter-chevron`}></i>
              </div>
              {!collapsedSections.price && (
                <div className="filter-group-body">
                  {PRICE_RANGES.map((p) => {
                    const isSelected = selectedPriceRange === p.id;
                    const count = getPriceRangeCount(p.id);
                    return (
                      <div
                        key={p.id}
                        className={`filter-row ${isSelected ? "active" : ""} ${count === 0 && !isSelected ? "disabled" : ""}`}
                        onClick={() => setSelectedPriceRange(isSelected ? "" : p.id)}
                      >
                        <div className="filter-radio">
                          {isSelected && <span className="filter-radio-dot" />}
                        </div>
                        <span className="filter-label">{p.label}</span>
                        <span className={`filter-count ${count === 0 ? "zero" : ""}`}>
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Usage Needs Group */}
            <div className="filter-group">
              <div
                className="filter-group-header"
                onClick={() => setCollapsedSections((s) => ({ ...s, need: !s.need }))}
              >
                <span>NHU CẦU SỬ DỤNG</span>
                <i className={`fa-solid fa-chevron-${collapsedSections.need ? "down" : "up"} filter-chevron`}></i>
              </div>
              {!collapsedSections.need && (
                <div className="filter-group-body">
                  {USAGE_NEEDS.map((n) => {
                    const isSelected = selectedNeed === n.id;
                    const count = getNeedCount(n.id);
                    return (
                      <div
                        key={n.id}
                        className={`filter-row ${isSelected ? "active" : ""} ${count === 0 && !isSelected ? "disabled" : ""}`}
                        onClick={() => setSelectedNeed(isSelected ? "" : n.id)}
                      >
                        <div className="filter-checkbox">
                          {isSelected && <i className="fa-solid fa-check"></i>}
                        </div>
                        <span className="filter-label">{n.label}</span>
                        <span className={`filter-count ${count === 0 ? "zero" : ""}`}>
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>

          {/* Product Listing Main */}
          <div>
            <ErrorBanner error={error} />
            {loading && <Loading />}

            {!loading && filteredProducts.length === 0 && (
              <Empty
                title="Không tìm thấy sản phẩm"
                text="Không có sản phẩm nào phù hợp với các tiêu chí lọc đã chọn."
                action={
                  <button
                    className="btn primary"
                    onClick={clearAllFilters}
                  >
                    Xem tất cả sản phẩm
                  </button>
                }
              />
            )}

            <div className="product-grid">
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            {filteredProducts.length > 0 && (
              <div className="pager">
                <button
                  className="btn"
                  disabled={page <= 0}
                  onClick={() => {
                    const n = new URLSearchParams(params);
                    n.set("page", String(Math.max(0, page - 1)));
                    setParams(n);
                  }}
                >
                  <i className="fa-solid fa-chevron-left"></i> Trang trước
                </button>
                <span className="small muted" style={{ fontWeight: "700" }}>
                  Trang {page + 1}
                </span>
                <button
                  className="btn"
                  disabled={filteredProducts.length < 12}
                  onClick={() => {
                    const n = new URLSearchParams(params);
                    n.set("page", String(page + 1));
                    setParams(n);
                  }}
                >
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
