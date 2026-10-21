import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import api from "../services/api";
import { ErrorBanner, Loading } from "../components/Feedback";
import { useAuth } from "../context/AuthContext";
import { money, STATUS_LABEL, SHOP_STATUS_LABEL, labelOf } from "../utils/catalog";

export default function SellerPage() {
  const { isSeller, isPlatformAdmin } = useAuth();
  const [shop, setShop] = useState(null);
  const [tab, setTab] = useState("products");
  const [cats, setCats] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [catForm, setCatForm] = useState({ name: "", description: "" });
  const [prodForm, setProdForm] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    brand: "",
    status: "ACTIVE"
  });

  const reload = async (s) => {
    const shopId = s.id;
    const [c, p, o] = await Promise.all([
      api.get("/products/categories", { params: { shopId } }),
      api.get("/products", { params: { shopId, size: 100 } }),
      api.get("/orders/seller", { params: { shopId } })
    ]);
    setCats(c.data.data || []);
    setProducts(p.data.data?.content || []);
    setOrders(o.data.data || []);
  };

  useEffect(() => {
    api
      .get("/shops/me")
      .then(async (r) => {
        const s = r.data.data;
        setShop(s);
        if (s.status === "APPROVED") await reload(s);
      })
      .catch((e) => setError(e))
      .finally(() => setLoading(false));
  }, []);

  if (isPlatformAdmin) return <Navigate to="/admin" replace />;
  if (!isSeller && !loading) return <Navigate to="/register-shop" replace />;
  if (loading) return <Loading />;
  if (!shop) {
    return (
      <section className="form-card">
        <ErrorBanner error={error} />
        <p>Chưa có cửa hàng. <Link to="/register-shop">Đăng ký bán hàng</Link></p>
      </section>
    );
  }
  if (shop.status !== "APPROVED") {
    return (
      <section className="form-card">
        <h1>{shop.name}</h1>
        <p>
          Trạng thái: {labelOf(SHOP_STATUS_LABEL, shop.status)}. Kênh người bán chỉ mở khi cửa hàng đang hoạt động.
        </p>
        <Link to="/register-shop">Xem hồ sơ</Link>
      </section>
    );
  }

  const createCat = async (e) => {
    e.preventDefault();
    try {
      await api.post("/products/categories", { ...catForm, shopId: shop.id });
      setCatForm({ name: "", description: "" });
      await reload(shop);
    } catch (err) {
      setError(err);
    }
  };

  const createProd = async (e) => {
    e.preventDefault();
    try {
      await api.post("/products", {
        shopId: shop.id,
        name: prodForm.name,
        description: prodForm.description,
        price: Number(prodForm.price),
        categoryId: Number(prodForm.categoryId),
        brand: prodForm.brand,
        status: prodForm.status
      });
      setProdForm({ name: "", description: "", price: "", categoryId: "", brand: "", status: "ACTIVE" });
      await reload(shop);
    } catch (err) {
      setError(err);
    }
  };

  return (
    <section>
      <div className="page-title">
        <p className="eyebrow">Kênh người bán</p>
        <h1>{shop.name}</h1>
        <p className="muted">
          Trang cửa hàng: <Link to={`/shops/${shop.id}`}>{shop.name}</Link>
        </p>
      </div>
      <ErrorBanner error={error} />
      <div className="cat-row" style={{ marginBottom: "1.5rem" }}>
        {["products", "categories", "orders"].map((t) => (
          <button key={t} type="button" className={`cat-chip ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t === "products" ? "Sản phẩm" : t === "categories" ? "Danh mục" : "Đơn hàng"}
          </button>
        ))}
      </div>

      {tab === "categories" && (
        <div className="split">
          <form className="form-card" onSubmit={createCat}>
            <h2>Thêm danh mục</h2>
            <label>
              Tên
              <input required value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} />
            </label>
            <label>
              Mô tả
              <input value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} />
            </label>
            <button className="btn">Lưu</button>
          </form>
          <ul className="plain-list">
            {cats.map((c) => (
              <li key={c.id}>
                <strong>{c.name}</strong> <span className="muted">#{c.id}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === "products" && (
        <div className="split">
          <form className="form-card" onSubmit={createProd}>
            <h2>Thêm sản phẩm</h2>
            <label>
              Tên
              <input required value={prodForm.name} onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })} />
            </label>
            <label>
              Danh mục
              <select required value={prodForm.categoryId} onChange={(e) => setProdForm({ ...prodForm, categoryId: e.target.value })}>
                <option value="">—</option>
                {cats.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Giá (VND)
              <input required type="number" min="1000" step="1000" value={prodForm.price} onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })} />
            </label>
            <label>
              Thương hiệu
              <input value={prodForm.brand} onChange={(e) => setProdForm({ ...prodForm, brand: e.target.value })} />
            </label>
            <button className="btn" disabled={!cats.length}>
              Lưu
            </button>
          </form>
          <ul className="plain-list">
            {products.map((p) => (
              <li key={p.id}>
                <strong>{p.name}</strong> — {money(p.price)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === "orders" && (
        <ul className="plain-list">
          {orders.length === 0 && <li className="muted">Chưa có đơn</li>}
          {orders.map((o) => (
            <li key={o.id}>
              <Link to={`/orders/${o.id}`}>
                Đơn #{o.id}
              </Link>{" "}
              {labelOf(STATUS_LABEL, o.status)} — {money(o.totalAmount)}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
