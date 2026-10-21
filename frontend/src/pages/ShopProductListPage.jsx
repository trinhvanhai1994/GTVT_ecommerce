import { useEffect, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import ProductCard from "../components/ProductCard.jsx";
import { Empty, ErrorBanner, Loading } from "../components/Feedback";

function isNumericId(value) {
  return /^\d+$/.test(String(value || ""));
}

export default function ShopProductListPage() {
  const { isSeller } = useAuth();
  const { shopId: shopKey } = useParams();
  const [myShopId, setMyShopId] = useState(null);
  const [params, setParams] = useSearchParams();
  const categoryId = params.get("categoryId");
  const [shop, setShop] = useState(null);
  const [cats, setCats] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [redirectId, setRedirectId] = useState(null);

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
    let cancelled = false;
    setLoading(true);
    setError(null);
    setRedirectId(null);

    const loadById = (id) =>
      Promise.all([
        api.get(`/shops/id/${id}`),
        api.get("/products/categories", { params: { shopId: id } }),
        api.get("/products", {
          params: {
            shopId: id,
            categoryId: categoryId || undefined,
            status: "ACTIVE",
            size: 50
          }
        })
      ]).then(([shopRes, catRes, prodRes]) => {
        if (cancelled) return;
        setShop(shopRes.data.data);
        setCats(catRes.data.data || []);
        setProducts(prodRes.data.data?.content || []);
      });

    const run = async () => {
      try {
        if (isNumericId(shopKey)) {
          await loadById(shopKey);
        } else {
          // Legacy slug URL → resolve once then redirect to stable id
          const res = await api.get(`/shops/${shopKey}`);
          if (cancelled) return;
          const s = res.data.data;
          if (s?.id != null) {
            setRedirectId(String(s.id));
            return;
          }
          throw new Error("Shop not found");
        }
      } catch (e) {
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [shopKey, categoryId]);

  if (redirectId) {
    const search = categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : "";
    return <Navigate to={`/shops/${redirectId}${search}`} replace />;
  }

  if (loading) return <Loading />;
  if (error || !shop) {
    return (
      <section>
        <ErrorBanner error={error} />
        <Empty title="Không tìm thấy cửa hàng" action={<Link className="btn" to="/">Về trang chủ</Link>} />
      </section>
    );
  }

  const id = shop.id;
  const setCategory = (nextId) => {
    const next = new URLSearchParams(params);
    if (nextId) next.set("categoryId", String(nextId));
    else next.delete("categoryId");
    setParams(next, { replace: true });
  };

  return (
    <section>
      <div className="shop-hero">
        <img
          className="shop-hero-logo"
          src={shop.logoUrl || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=200&q=80"}
          alt=""
        />
        <div>
          <p className="eyebrow">Gian hàng</p>
          <h1>{shop.name}</h1>
          {shop.description && <p className="lede">{shop.description}</p>}
        </div>
      </div>

      {isSeller && (
        <div className="banner" style={{ marginBottom: "1rem" }}>
          <Link to="/seller">← Kênh người bán</Link>
          {myShopId != null && Number(id) === Number(myShopId) && (
            <>
              {" "}
              · Vitrine cửa hàng của bạn — quản lý SP tại{" "}
              <Link to="/seller/products">Sản phẩm</Link>.
            </>
          )}
        </div>
      )}

      {cats.length > 0 && (
        <div className="cat-row" style={{ marginBottom: "1.25rem" }}>
          <button
            type="button"
            className={`cat-chip ${!categoryId ? "active" : ""}`}
            onClick={() => setCategory(null)}
          >
            Tất cả
          </button>
          {cats.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`cat-chip ${String(categoryId) === String(c.id) ? "active" : ""}`}
              onClick={() => setCategory(c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      <ErrorBanner error={error} />
      {products.length === 0 && (
        <Empty
          title="Không có sản phẩm"
          text={categoryId ? "Danh mục này chưa có sản phẩm." : "Cửa hàng chưa đăng sản phẩm."}
          action={
            categoryId ? (
              <button type="button" className="btn" onClick={() => setCategory(null)}>
                Xem tất cả
              </button>
            ) : (
              <Link className="btn" to="/">
                Về trang chủ
              </Link>
            )
          }
        />
      )}
      <div className="product-grid">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} shopId={id} />
        ))}
      </div>
    </section>
  );
}
