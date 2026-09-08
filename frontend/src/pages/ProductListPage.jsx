import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import ProductCard from "../components/ProductCard.jsx";
import { Empty, ErrorBanner, Loading } from "../components/Feedback";

export default function ProductListPage() {
  const [params, setParams] = useSearchParams();
  const [pageData, setPageData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState(params.get("keyword") || "");
  const [categoryId, setCategoryId] = useState(params.get("categoryId") || "");
  const page = Number(params.get("page") || 0);

  useEffect(() => {
    setKeyword(params.get("keyword") || "");
    setCategoryId(params.get("categoryId") || "");
  }, [params]);

  useEffect(() => {
    void api.get("/products/categories").then((res) => setCategories(res.data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    void api
      .get("/products", {
        params: {
          keyword: params.get("keyword") || undefined,
          categoryId: params.get("categoryId") || undefined,
          page,
          size: 8,
          status: "ACTIVE"
        }
      })
      .then((res) => setPageData(res.data.data))
      .catch(setError)
      .finally(() => setLoading(false));
  }, [params, page]);

  const applyFilters = (e) => {
    e.preventDefault();
    const next = new URLSearchParams();
    if (keyword) next.set("keyword", keyword);
    if (categoryId) next.set("categoryId", categoryId);
    next.set("page", "0");
    setParams(next);
  };

  return (
    <section>
      <div className="page-title">
        <p className="eyebrow">Cửa hàng</p>
        <h1>Sản phẩm</h1>
        <p className="muted">{pageData ? `${pageData.totalElements} mặt hàng` : "Đang tải danh mục"}</p>
      </div>
      <form className="filter-bar" onSubmit={applyFilters}>
        <input placeholder="Tìm theo tên..." value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Mọi danh mục</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button className="btn">Lọc</button>
      </form>
      <ErrorBanner error={error} />
      {loading && <Loading />}
      {!loading && pageData && pageData.content?.length === 0 && (
        <Empty title="Không tìm thấy sản phẩm" text="Thử từ khóa khác hoặc xóa bộ lọc." />
      )}
      <div className="product-grid">
        {pageData?.content?.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      {pageData && pageData.totalPages > 1 && (
        <div className="pager">
          <button
            className="btn btn-ghost"
            disabled={page <= 0}
            onClick={() => {
              const n = new URLSearchParams(params);
              n.set("page", String(page - 1));
              setParams(n);
            }}
          >
            Trước
          </button>
          <span>
            Trang {page + 1} / {pageData.totalPages}
          </span>
          <button
            className="btn btn-ghost"
            disabled={page + 1 >= pageData.totalPages}
            onClick={() => {
              const n = new URLSearchParams(params);
              n.set("page", String(page + 1));
              setParams(n);
            }}
          >
            Sau
          </button>
        </div>
      )}
    </section>
  );
}
