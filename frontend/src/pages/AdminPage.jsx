import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import { Empty, ErrorBanner, Loading } from "../components/Feedback";
import { useAuth } from "../context/AuthContext";
import { money, STATUS_LABEL } from "../utils/catalog";

const VIEWS = [
  { id: "home", label: "Tổng quan", hint: "Việc cần làm hôm nay" },
  { id: "orders", label: "Đơn hàng", hint: "Xử lý · giao · hoàn tất" },
  { id: "catalog", label: "Sản phẩm", hint: "Catalog và danh mục" },
  { id: "stock", label: "Tồn kho", hint: "Sửa số lượng tại chỗ" },
  { id: "people", label: "Người dùng", hint: "Tài khoản hệ thống" }
];

const NEXT_STATUS = {
  PENDING: "PROCESSING",
  PAYMENT_PENDING: "PROCESSING",
  CONFIRMED: "PROCESSING",
  PROCESSING: "SHIPPING",
  SHIPPING: "DELIVERED"
};

const NEXT_LABEL = {
  PROCESSING: "Bắt đầu xử lý",
  SHIPPING: "Chuyển giao hàng",
  DELIVERED: "Đã giao xong"
};

const OPEN_ORDER = new Set(["PENDING", "PAYMENT_PENDING", "CONFIRMED", "PROCESSING", "SHIPPING"]);

export default function AdminPage() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const view = VIEWS.some((v) => v.id === params.get("view")) ? params.get("view") : "home";
  const [openOrders, setOpenOrders] = useState(0);

  const go = (id) => {
    const next = new URLSearchParams(params);
    next.set("view", id);
    setParams(next, { replace: true });
  };

  return (
    <section className="admin-shell">
      <nav className="admin-nav" aria-label="Quản trị">
        {VIEWS.map((item) => (
          <button key={item.id} type="button" className={view === item.id ? "on" : ""} onClick={() => go(item.id)}>
            {item.id === "orders" && openOrders > 0 && <span className="nav-count">{openOrders}</span>}
            {item.label}
            <small>{item.hint}</small>
          </button>
        ))}
      </nav>
      <div>
        <header className="admin-head">
          <div>
            <p className="eyebrow">Nội bộ · {user?.fullName || "Admin"}</p>
            <h1>{VIEWS.find((v) => v.id === view)?.label}</h1>
          </div>
        </header>
        {view === "home" && <Overview onGo={go} onOpenCount={setOpenOrders} />}
        {view === "orders" && <OrdersAdmin onOpenCount={setOpenOrders} />}
        {view === "catalog" && <CatalogAdmin />}
        {view === "stock" && <InventoryAdmin />}
        {view === "people" && <UsersAdmin />}
      </div>
    </section>
  );
}

function Overview({ onGo, onOpenCount }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    void Promise.all([
      api.get("/admin/orders"),
      api.get("/admin/users"),
      api.get("/inventory"),
      api.get("/products", { params: { size: 80 } })
    ])
      .then(([ordersRes, usersRes, invRes, productsRes]) => {
        const orders = ordersRes.data.data || [];
        const inventory = invRes.data.data || [];
        const products = productsRes.data.data?.content || [];
        const names = Object.fromEntries(products.map((p) => [p.id, p.name]));
        const open = orders.filter((o) => OPEN_ORDER.has(o.status));
        const low = inventory.filter((r) => Number(r.availableQuantity) <= 5);
        onOpenCount?.(open.length);
        setStats({
          products: productsRes.data.data?.totalElements || products.length,
          users: (usersRes.data.data || []).length,
          orders: orders.length,
          open,
          low: low.map((r) => ({ ...r, name: names[r.productId] || `SP #${r.productId}` }))
        });
      })
      .catch(setError);
  }, [onOpenCount]);

  if (error) return <ErrorBanner error={error} />;
  if (!stats) return <Loading text="Đang tải tổng quan..." />;

  return (
    <>
      <div className="kpi-grid">
        <button type="button" className="stat kpi" onClick={() => onGo("orders")}>
          <span>Đơn cần xử lý</span>
          <strong>{stats.open.length}</strong>
          <em>Mở danh sách đơn →</em>
        </button>
        <button type="button" className="stat kpi" onClick={() => onGo("stock")}>
          <span>Sắp hết hàng</span>
          <strong>{stats.low.length}</strong>
          <em>Điều chỉnh tồn →</em>
        </button>
        <button type="button" className="stat kpi" onClick={() => onGo("catalog")}>
          <span>Sản phẩm</span>
          <strong>{stats.products}</strong>
          <em>Quản lý catalog →</em>
        </button>
        <button type="button" className="stat kpi" onClick={() => onGo("people")}>
          <span>Người dùng</span>
          <strong>{stats.users}</strong>
          <em>Xem tài khoản →</em>
        </button>
      </div>
      <div className="work-grid">
        <div className="admin-card">
          <div className="panel-title">
            <h2>Hàng đợi đơn</h2>
            <button type="button" className="linkish" onClick={() => onGo("orders")}>
              Tất cả
            </button>
          </div>
          {stats.open.length === 0 ? (
            <Empty title="Không có đơn đang mở" text="Khi khách đặt hàng, bước tiếp theo sẽ hiện ở đây." />
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Đơn</th>
                  <th>Trạng thái</th>
                  <th className="num">Tổng</th>
                </tr>
              </thead>
              <tbody>
                {stats.open.slice(0, 6).map((o) => (
                  <tr key={o.id}>
                    <td>#{o.id}</td>
                    <td>
                      <span className={`status ${o.status}`}>{STATUS_LABEL[o.status] || o.status}</span>
                    </td>
                    <td className="num">{money(o.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="admin-card">
          <div className="panel-title">
            <h2>Tồn thấp</h2>
            <button type="button" className="linkish" onClick={() => onGo("stock")}>
              Sửa tồn
            </button>
          </div>
          {stats.low.length === 0 ? (
            <Empty title="Tồn ổn" text="Không có SKU nào ≤ 5." />
          ) : (
            <ul className="plain-list">
              {stats.low.slice(0, 6).map((r) => (
                <li key={r.id}>
                  {r.name} · <span className="stock-low">{r.availableQuantity} cái</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

function CatalogAdmin() {
  const [page, setPage] = useState(null);
  const [cats, setCats] = useState([]);
  const [q, setQ] = useState("");
  const [form, setForm] = useState({ name: "", price: "99", categoryId: "", brand: "Nava", status: "ACTIVE" });
  const [catForm, setCatForm] = useState({ name: "", description: "" });
  const [error, setError] = useState(null);
  const [ok, setOk] = useState("");

  const load = () =>
    Promise.all([api.get("/products", { params: { size: 50 } }), api.get("/products/categories")])
      .then(([p, c]) => {
        setPage(p.data.data);
        setCats(c.data.data || []);
      })
      .catch(setError);

  useEffect(() => {
    void load();
  }, []);

  const catName = (id) => cats.find((c) => c.id === id)?.name || `#${id}`;
  const rows = useMemo(() => {
    const list = page?.content || [];
    const term = q.trim().toLowerCase();
    if (!term) return list;
    return list.filter((p) => `${p.name} ${p.brand}`.toLowerCase().includes(term));
  }, [page, q]);

  const createProduct = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/products", {
        name: form.name,
        description: form.name,
        price: Number(form.price),
        categoryId: Number(form.categoryId),
        brand: form.brand,
        status: form.status
      });
      setForm({ ...form, name: "" });
      setOk("Đã thêm sản phẩm.");
      load();
    } catch (err) {
      setError(err);
    }
  };

  const createCat = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/products/categories", catForm);
      setCatForm({ name: "", description: "" });
      setOk("Đã thêm danh mục.");
      load();
    } catch (err) {
      setError(err);
    }
  };

  const remove = async (id, name) => {
    if (!window.confirm(`Xóa sản phẩm “${name}”?`)) return;
    try {
      await api.delete(`/products/${id}`);
      load();
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div className="catalog-split">
      <div className="admin-card">
        <div className="panel-title">
          <h2>Danh sách</h2>
          <input className="search-inline" placeholder="Lọc theo tên, hãng..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <ErrorBanner error={error} />
        {ok && <div className="banner ok">{ok}</div>}
        <form className="admin-form cols-3" onSubmit={createProduct}>
          <label>
            <span>Tên sản phẩm</span>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </label>
          <label>
            <span>Giá (USD)</span>
            <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
          </label>
          <label>
            <span>Danh mục</span>
            <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required>
              <option value="">Chọn...</option>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <button className="btn" type="submit">
            Thêm
          </button>
        </form>
        {!rows.length ? (
          <Empty title="Chưa có sản phẩm khớp" />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Sản phẩm</th>
                <th>Danh mục</th>
                <th className="num">Giá</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td>#{p.id}</td>
                  <td>
                    {p.name}
                    <div className="muted">{p.brand}</div>
                  </td>
                  <td>{catName(p.categoryId)}</td>
                  <td className="num">{money(p.price)}</td>
                  <td>
                    <button type="button" className="linkish" onClick={() => remove(p.id, p.name)}>
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="admin-card">
        <h2>Danh mục</h2>
        <p className="muted">Tạo danh mục trước khi thêm sản phẩm mới.</p>
        <form className="admin-form" onSubmit={createCat}>
          <label>
            <span>Tên danh mục</span>
            <input value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} required />
          </label>
          <label>
            <span>Mô tả</span>
            <input value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} />
          </label>
          <button className="btn" type="submit">
            Thêm danh mục
          </button>
        </form>
        <ul className="plain-list">
          {cats.map((c) => (
            <li key={c.id}>
              {c.name} <span className="muted">#{c.id}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function InventoryAdmin() {
  const [rows, setRows] = useState([]);
  const [names, setNames] = useState({});
  const [draft, setDraft] = useState({});
  const [error, setError] = useState(null);
  const [ok, setOk] = useState("");

  const load = () =>
    Promise.all([api.get("/inventory"), api.get("/products", { params: { size: 80 } })])
      .then(([inv, products]) => {
        const list = inv.data.data || [];
        setRows(list);
        setNames(Object.fromEntries((products.data.data?.content || []).map((p) => [p.id, p.name])));
        setDraft(Object.fromEntries(list.map((r) => [r.productId, r.availableQuantity])));
      })
      .catch(setError);

  useEffect(() => {
    void load();
  }, []);

  const save = async (productId) => {
    setError(null);
    setOk("");
    try {
      await api.put(`/inventory/${productId}`, { availableQuantity: Number(draft[productId]) });
      setOk(`Đã cập nhật SP #${productId}.`);
      load();
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div className="admin-card">
      <p className="muted">Sửa số khả dụng ngay trên dòng — không cần nhớ mã sản phẩm.</p>
      <ErrorBanner error={error} />
      {ok && <div className="banner ok">{ok}</div>}
      {!rows.length ? (
        <Empty title="Chưa có bản ghi tồn" text="Tồn được tạo khi thêm sản phẩm." />
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th className="num">Khả dụng</th>
              <th className="num">Đang giữ</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>
                  {names[r.productId] || `Sản phẩm #${r.productId}`}
                  <div className="muted">#{r.productId}</div>
                </td>
                <td className="num">
                  <input
                    className="inline-qty"
                    type="number"
                    min="0"
                    value={draft[r.productId] ?? r.availableQuantity}
                    onChange={(e) => setDraft({ ...draft, [r.productId]: e.target.value })}
                  />
                  {Number(r.availableQuantity) <= 5 && <div className="stock-low">Thấp</div>}
                </td>
                <td className="num">{r.reservedQuantity}</td>
                <td>
                  <button type="button" className="btn btn-sm" onClick={() => save(r.productId)}>
                    Lưu
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function OrdersAdmin({ onOpenCount }) {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("OPEN");

  const load = () =>
    api
      .get("/admin/orders")
      .then((r) => {
        const list = r.data.data || [];
        setRows(list);
        onOpenCount?.(list.filter((o) => OPEN_ORDER.has(o.status)).length);
      })
      .catch(setError);

  useEffect(() => {
    void load();
  }, []);

  const patch = async (id, status) => {
    setError(null);
    try {
      await api.patch(`/admin/orders/${id}/status`, { status });
      load();
    } catch (err) {
      setError(err);
    }
  };

  const shown = rows.filter((o) => (filter === "OPEN" ? OPEN_ORDER.has(o.status) : true));

  return (
    <div className="admin-card">
      <div className="panel-title">
        <p className="muted">Mỗi đơn một hành động kế tiếp — tránh bấm nhầm trạng thái.</p>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="OPEN">Đang mở</option>
          <option value="ALL">Tất cả</option>
        </select>
      </div>
      <ErrorBanner error={error} />
      {!shown.length ? (
        <Empty title="Không có đơn trong bộ lọc này" />
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Đơn</th>
              <th>Khách</th>
              <th>Trạng thái</th>
              <th className="num">Tổng</th>
              <th>Việc tiếp theo</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((o) => {
              const next = NEXT_STATUS[o.status];
              return (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td>
                    {o.shippingName}
                    <div className="muted">{o.shippingAddress}</div>
                  </td>
                  <td>
                    <span className={`status ${o.status}`}>{STATUS_LABEL[o.status] || o.status}</span>
                  </td>
                  <td className="num">{money(o.totalAmount)}</td>
                  <td>
                    {next ? (
                      <button type="button" className="btn btn-sm" onClick={() => patch(o.id, next)}>
                        {NEXT_LABEL[next]}
                      </button>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

function UsersAdmin() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    void api.get("/admin/users").then((r) => setRows(r.data.data || [])).catch(setError);
  }, []);

  return (
    <div className="admin-card">
      <p className="muted">Danh sách tài khoản. Admin không dùng giỏ hàng — chỉ vận hành cửa hàng.</p>
      <ErrorBanner error={error} />
      <table className="data-table">
        <thead>
          <tr>
            <th>Họ tên</th>
            <th>Email</th>
            <th>Vai trò</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((u) => (
            <tr key={u.id}>
              <td>{u.fullName}</td>
              <td>{u.email}</td>
              <td>
                <span className={`chip-admin ${u.role}`}>{u.role === "ADMIN" ? "Quản trị" : "Khách"}</span>
              </td>
              <td>{u.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
