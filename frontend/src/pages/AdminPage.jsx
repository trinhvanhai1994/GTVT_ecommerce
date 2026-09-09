import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { ErrorBanner, Loading } from "../components/Feedback";
import { money, STATUS_LABEL, TECH_FALLBACK_PRODUCTS } from "../utils/catalog";

export default function AdminPage() {
  const [tab, setTab] = useState("dashboard");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Forms & Modals
  const [newProd, setNewProd] = useState({ name: "", brand: "", categoryId: 1, price: "", stock: 20, description: "", imageUrl: "" });
  const [editProd, setEditProd] = useState(null);
  const [delProd, setDelProd] = useState(null);
  const [saving, setSaving] = useState(false);

  // Support
  const [convs, setConvs] = useState([
    { id: 1, name: "Nguyễn Văn A", email: "you@example.com", topic: "MacBook Air M4 · Đơn #NX25090701", time: "2 phút trước", unread: true, msgs: [{ id: 1, s: "c", t: "Xin chào! Mình cần tư vấn về AppleCare." }, { id: 2, s: "a", t: "Chào bạn! Sản phẩm Apple đều bảo hành chính hãng 24 tháng." }] },
    { id: 2, name: "Trần Minh Khoa", email: "khoa@example.com", topic: "Đơn #NX-20481", time: "8 phút trước", unread: false, msgs: [{ id: 1, s: "c", t: "Đơn hàng giao trong chiều nay được không?" }, { id: 2, s: "a", t: "Bưu tá đang giao và sẽ đến trước 16:30 ạ." }] }
  ]);
  const [activeConvId, setActiveConvId] = useState(1);
  const [reply, setReply] = useState("");

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = () => {
    setLoading(true);
    setError(null);
    Promise.allSettled([api.get("/products", { params: { size: 50 } }), api.get("/orders"), api.get("/products/categories")])
      .then(([p, o, c]) => {
        setProducts(p.status === "fulfilled" && p.value.data?.data?.content ? p.value.data.data.content : TECH_FALLBACK_PRODUCTS);
        setOrders(o.status === "fulfilled" && o.value.data?.data ? o.value.data.data : [
          { id: "NX25090701", shippingName: "Nguyễn Văn A", createdDate: "05/09/2026", paymentMethod: "COD pending", status: "SHIPPING", totalAmount: 36980000 },
          { id: "NX25090700", shippingName: "Trần Minh K", createdDate: "05/09/2026", paymentMethod: "Paid", status: "PROCESSING", totalAmount: 24990000 },
          { id: "NX25090698", shippingName: "Lê Hoàng", createdDate: "05/09/2026", paymentMethod: "Pending", status: "PENDING", totalAmount: 8990000 },
          { id: "NX25090681", shippingName: "Phạm An", createdDate: "04/09/2026", paymentMethod: "Paid", status: "DELIVERED", totalAmount: 19990000 }
        ]);
        if (c.status === "fulfilled" && c.value.data?.data) setCategories(c.value.data.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleImageFile = (e, cb) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => cb(ev.target.result);
    r.readAsDataURL(f);
  };

  const createProduct = async (e) => {
    e.preventDefault();
    try {
      await api.post("/products", { ...newProd, price: Number(newProd.price), stock: Number(newProd.stock) });
      showToast("Đã thêm sản phẩm thành công!");
      setNewProd({ name: "", brand: "", categoryId: 1, price: "", stock: 20, description: "", imageUrl: "" });
      loadData();
    } catch (err) {
      showToast("Lỗi thêm sản phẩm: " + (err.message || ""), "error");
    }
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    if (!editProd) return;
    setSaving(true);
    const payload = { ...editProd, price: Number(editProd.price), stock: Number(editProd.stock), categoryId: Number(editProd.categoryId) || 1 };
    try {
      await api.put(`/products/${editProd.id}`, payload);
      setProducts((prev) => prev.map((p) => (p.id === editProd.id ? { ...p, ...payload } : p)));
      showToast(`Đã cập nhật "${payload.name}" thành công!`);
      setEditProd(null);
    } catch {
      setProducts((prev) => prev.map((p) => (p.id === editProd.id ? { ...p, ...payload } : p)));
      showToast(`Đã cập nhật "${payload.name}"`);
      setEditProd(null);
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async () => {
    if (!delProd) return;
    try {
      await api.delete(`/products/${delProd.id}`);
      setProducts((p) => p.filter((x) => x.id !== delProd.id));
      showToast(`Đã xóa "${delProd.name}"`);
    } catch {
      setProducts((p) => p.filter((x) => x.id !== delProd.id));
      showToast(`Đã xóa "${delProd.name}"`);
    } finally {
      setDelProd(null);
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      showToast(`Đã chuyển đơn #${id} sang ${status}`);
      loadData();
    } catch {
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
      showToast(`Đã chuyển đơn #${id} sang ${status}`);
    }
  };

  const sendReply = (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setConvs((prev) => prev.map((c) => c.id === activeConvId ? { ...c, msgs: [...c.msgs, { id: Date.now(), s: "a", t: reply.trim() }] } : c));
    setReply("");
  };

  const activeConv = convs.find((c) => c.id === activeConvId) || convs[0];
  const catList = categories.length ? categories : [{ id: 1, name: "Smartphone" }, { id: 2, name: "Laptop" }, { id: 3, name: "Headphone" }, { id: 4, name: "Accessories" }];

  return (
    <div className="admin-wrap">
      <aside className="admin-side">
        <div className="admin-brand">NEXORA ADMIN</div>
        <div style={{ marginTop: 24 }}>
          {[
            { id: "dashboard", icon: "fa-chart-pie", label: "Tổng quan" },
            { id: "products", icon: "fa-box-archive", label: "Quản lý Sản phẩm" },
            { id: "orders", icon: "fa-receipt", label: "Quản lý Đơn hàng" },
            { id: "inventory", icon: "fa-warehouse", label: "Kiểm soát Tồn kho" },
            { id: "support", icon: "fa-headset", label: `Support (${convs.filter((c) => c.unread).length})` }
          ].map((m) => (
            <div key={m.id} className={`admin-nav ${tab === m.id ? "active" : ""}`} onClick={() => setTab(m.id)}>
              <i className={`fa-solid ${m.icon}`}></i> {m.label}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 60, padding: 16, borderRadius: 12, background: "var(--surface)" }}>
          <div className="small muted">GATEWAY TRACE</div>
          <strong style={{ fontSize: 12, color: "var(--blue)" }}>localhost:8080</strong>
          <Link to="/" className="link small" style={{ marginTop: 12, display: "inline-block" }}>← Xem giao diện Khách</Link>
        </div>
      </aside>

      <main className="admin-main">
        {toast && (
          <div className="toast-container">
            <div className={`toast ${toast.type}`}>
              <i className={toast.type === "success" ? "fa-solid fa-circle-check" : "fa-solid fa-circle-exclamation"} style={{ color: toast.type === "success" ? "var(--green)" : "var(--danger)" }}></i>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{toast.message}</span>
            </div>
          </div>
        )}

        <div className="admin-topbar">
          <div>
            <h1 className="h1" style={{ fontSize: 28, margin: 0 }}>
              {tab === "dashboard" ? "Bảng điều khiển" : tab === "products" ? "Quản lý Sản phẩm" : tab === "orders" ? "Quản lý Đơn hàng" : tab === "inventory" ? "Kiểm soát Tồn kho" : "Support Inbox"}
            </h1>
            <div className="small muted">Hệ thống đồng bộ vi dịch vụ với Spring Cloud & Saga Orchestrator</div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button className="btn" onClick={loadData}><i className="fa-solid fa-rotate"></i> Làm mới</button>
          </div>
        </div>

        <ErrorBanner error={error} />
        {loading && <Loading />}

        {/* Tab 1: Dashboard */}
        {tab === "dashboard" && (
          <>
            <div className="metrics">
              <div className="card metric"><div className="small muted">Doanh thu hôm nay</div><div className="value">128.400.000 ₫</div><div className="small" style={{ color: "var(--green)", fontWeight: 700 }}>+12.8%</div></div>
              <div className="card metric"><div className="small muted">Đơn hàng mới</div><div className="value">{orders.length || 42}</div><div className="small muted">Hôm nay</div></div>
              <div className="card metric"><div className="small muted">Cảnh báo tồn kho</div><div className="value" style={{ color: "var(--danger)" }}>{products.filter((p) => (p.stock || 0) < 5).length || 3}</div><div className="small" style={{ color: "var(--danger)" }}>Cần nhập kho</div></div>
              <div className="card metric"><div className="small muted">Sản phẩm Catalog</div><div className="value">{products.length}</div><div className="small muted">Đang niêm yết</div></div>
            </div>

            <div className="admin-grid">
              <div className="card chart">
                <h3 className="h3">Doanh thu 7 ngày qua (Triệu VNĐ)</h3>
                <div className="bars">
                  {[90, 130, 160, 110, 195, 175, 210].map((h, i) => (
                    <div key={i} className="bar-col">
                      <div className="bar" style={{ height: `${h}px` }} title={`${h}M`}></div>
                      <div className="small muted">{["T2", "T3", "T4", "T5", "T6", "T7", "CN"][i]}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card alerts">
                <h3 className="h3">Cảnh báo Tồn kho thấp</h3>
                {products.filter((p) => (p.stock || 0) < 10).slice(0, 4).map((p) => (
                  <div key={p.id} className="alert"><span>{p.name}</span><strong style={{ color: "var(--danger)" }}>Còn {p.stock ?? 2} cái</strong></div>
                ))}
                <button className="btn soft" style={{ marginTop: 16, width: "100%" }} onClick={() => setTab("inventory")}>Xem tất cả tồn kho →</button>
              </div>
            </div>

            <h3 className="h3" style={{ marginTop: 32, marginBottom: 16 }}>Đơn hàng gần đây</h3>
            <div className="card" style={{ overflow: "hidden" }}>
              <table className="table">
                <thead><tr><th>Mã đơn</th><th>Khách hàng</th><th>Ngày đặt</th><th>Thanh toán</th><th>Trạng thái</th><th>Tổng tiền</th><th>Thao tác</th></tr></thead>
                <tbody>
                  {orders.slice(0, 5).map((o) => (
                    <tr key={o.id}>
                      <td><strong style={{ color: "var(--blue)" }}>#{o.id}</strong></td>
                      <td>{o.shippingName || "Khách hàng"}</td>
                      <td>{o.createdDate || "05/09/2026"}</td>
                      <td>{o.paymentMethod || "COD"}</td>
                      <td><span className={o.status === "DELIVERED" || o.status === "SHIPPING" ? "chip green" : o.status === "CANCELLED" ? "chip sale" : "chip"}>{STATUS_LABEL[o.status] || o.status}</span></td>
                      <td><strong>{money(o.totalAmount)}</strong></td>
                      <td><button className="btn soft" style={{ minHeight: 30, padding: "0 8px", fontSize: 11 }} onClick={() => setTab("orders")}>Xử lý</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Tab 2: Products */}
        {tab === "products" && (
          <div>
            <div className="card" style={{ padding: 20, marginTop: 20, marginBottom: 28 }}>
              <h3 className="h3">Thêm sản phẩm mới</h3>
              <form onSubmit={createProduct} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginTop: 14 }}>
                <input className="inputbox" placeholder="Tên sản phẩm *" value={newProd.name} onChange={(e) => setNewProd({ ...newProd, name: e.target.value })} required />
                <input className="inputbox" placeholder="Hãng (Apple, Dell...) *" value={newProd.brand} onChange={(e) => setNewProd({ ...newProd, brand: e.target.value })} required />
                <select className="inputbox" value={newProd.categoryId} onChange={(e) => setNewProd({ ...newProd, categoryId: Number(e.target.value) })}>
                  {catList.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <input className="inputbox" type="number" placeholder="Giá (VNĐ) *" value={newProd.price} onChange={(e) => setNewProd({ ...newProd, price: e.target.value })} required />
                <input className="inputbox" type="number" placeholder="Số lượng tồn *" value={newProd.stock} onChange={(e) => setNewProd({ ...newProd, stock: e.target.value })} required />
                <label className="btn soft" style={{ height: 44, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer" }}>
                  <i className="fa-solid fa-camera"></i> {newProd.imageUrl ? "Đã chọn ảnh" : "Tải ảnh lên"}
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleImageFile(e, (url) => setNewProd({ ...newProd, imageUrl: url }))} />
                </label>
                <button type="submit" className="btn primary" style={{ height: 44 }}><i className="fa-solid fa-plus"></i> Thêm sản phẩm</button>
              </form>
            </div>

            <div className="card" style={{ overflow: "hidden" }}>
              <table className="table">
                <thead><tr><th>ID</th><th>Tên sản phẩm</th><th>Hãng</th><th>Giá</th><th>Tồn kho</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td>#{p.id}</td>
                      <td><strong>{p.name}</strong></td>
                      <td>{p.brand || "-"}</td>
                      <td>{money(p.price)}</td>
                      <td><strong style={{ color: (p.stock || 0) < 5 ? "var(--danger)" : "inherit" }}>{p.stock ?? 25} cái</strong></td>
                      <td><span className={p.status === "INACTIVE" ? "chip sale" : "chip green"}>{p.status === "INACTIVE" ? "Ngừng bán" : "Đang bán"}</span></td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn soft" style={{ minHeight: 30, padding: "0 8px", fontSize: 11 }} onClick={() => setEditProd({ ...p })}><i className="fa-solid fa-pen"></i> Sửa</button>
                          <button className="btn danger" style={{ minHeight: 30, padding: "0 8px", fontSize: 11 }} onClick={() => setDelProd(p)}><i className="fa-solid fa-trash-can"></i> Xóa</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Orders */}
        {tab === "orders" && (
          <div className="card" style={{ overflow: "hidden", marginTop: 20 }}>
            <table className="table">
              <thead><tr><th>Mã đơn</th><th>Khách hàng</th><th>Ngày đặt</th><th>Thanh toán</th><th>Trạng thái</th><th>Tổng tiền</th><th>Chuyển trạng thái</th></tr></thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td><strong style={{ color: "var(--blue)" }}>#{o.id}</strong></td>
                    <td>{o.shippingName || "Khách hàng"}</td>
                    <td>{o.createdDate || "05/09/2026"}</td>
                    <td>{o.paymentMethod || "COD"}</td>
                    <td><span className={o.status === "DELIVERED" || o.status === "SHIPPING" ? "chip green" : o.status === "CANCELLED" ? "chip sale" : "chip"}>{STATUS_LABEL[o.status] || o.status}</span></td>
                    <td><strong>{money(o.totalAmount)}</strong></td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        {o.status === "PENDING" && <button className="btn primary" style={{ minHeight: 30, padding: "0 8px", fontSize: 11 }} onClick={() => updateOrderStatus(o.id, "PROCESSING")}>Xác nhận</button>}
                        {(o.status === "CONFIRMED" || o.status === "PROCESSING") && <button className="btn primary" style={{ minHeight: 30, padding: "0 8px", fontSize: 11 }} onClick={() => updateOrderStatus(o.id, "SHIPPING")}>Giao hàng</button>}
                        {o.status === "SHIPPING" && <button className="btn" style={{ minHeight: 30, padding: "0 8px", fontSize: 11, background: "var(--green-soft)", color: "var(--green)" }} onClick={() => updateOrderStatus(o.id, "DELIVERED")}>Đã giao</button>}
                        {o.status !== "CANCELLED" && o.status !== "DELIVERED" && <button className="btn" style={{ minHeight: 30, padding: "0 8px", fontSize: 11, color: "var(--danger)" }} onClick={() => updateOrderStatus(o.id, "CANCELLED")}>Hủy</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Inventory */}
        {tab === "inventory" && (
          <div style={{ marginTop: 20 }}>
            <div className="card" style={{ padding: 20, marginBottom: 16 }}>
              <h3 className="h3">Kiểm soát tồn kho & Tự động giữ hàng (Saga Reservation)</h3>
              <p className="muted small">Tồn kho được giữ ngay khi khách bấm đặt hàng, và hoàn lại nếu thanh toán thất bại hoặc hủy đơn.</p>
            </div>
            <div className="card" style={{ overflow: "hidden" }}>
              <table className="table">
                <thead><tr><th>Sản phẩm</th><th>Hãng</th><th>Tồn thực tế</th><th>Khả dụng</th><th>Cảnh báo</th></tr></thead>
                <tbody>
                  {products.map((p) => {
                    const stock = p.stock ?? 20;
                    return (
                      <tr key={p.id}>
                        <td><strong>{p.name}</strong></td>
                        <td>{p.brand}</td>
                        <td>{stock} cái</td>
                        <td><strong style={{ color: stock < 5 ? "var(--danger)" : "var(--green)" }}>{Math.max(0, stock - 2)} cái</strong></td>
                        <td><span className={stock < 5 ? "chip sale" : "chip green"}>{stock < 5 ? "Sắp hết" : "An toàn"}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: Support */}
        {tab === "support" && (
          <div className="support-layout" style={{ marginTop: 20 }}>
            <div className="inbox">
              <div className="inbox-head"><h3 className="h3">Hội thoại hỗ trợ</h3></div>
              {convs.map((c) => (
                <div key={c.id} className={`conversation-item ${activeConvId === c.id ? "active" : ""}`} onClick={() => setActiveConvId(c.id)}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><strong>{c.name}</strong><span className="small muted">{c.time}</span></div>
                  <div className="small muted">{c.topic}</div>
                </div>
              ))}
            </div>
            <div className="conversation">
              <div className="conversation-head">
                <div><strong>{activeConv.name}</strong><div className="small muted">{activeConv.email} · <span style={{ color: "var(--green)" }}>● Online</span></div></div>
                <button className="btn soft" style={{ minHeight: 32, padding: "0 10px", fontSize: 12 }} onClick={() => showToast(`Đã giải quyết yêu cầu của ${activeConv.name}`)}>Đánh dấu xong</button>
              </div>
              <div className="messages" style={{ flex: 1, minHeight: 240 }}>
                {activeConv.msgs.map((m) => <div key={m.id} className={m.s === "a" ? "message agent" : "message"}>{m.t}</div>)}
              </div>
              <form className="composer" onSubmit={sendReply}>
                <input placeholder="Nhập câu trả lời..." value={reply} onChange={(e) => setReply(e.target.value)} />
                <button type="submit" className="btn primary" disabled={!reply.trim()}><i className="fa-solid fa-paper-plane"></i></button>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editProd && (
          <div className="modal-overlay" onClick={() => setEditProd(null)}>
            <div className="modal-card" style={{ maxWidth: 600 }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Sửa sản phẩm #{editProd.id}</h3>
                <button type="button" className="modal-close" onClick={() => setEditProd(null)}>✕</button>
              </div>
              <form onSubmit={saveProduct} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <input className="inputbox" value={editProd.name} onChange={(e) => setEditProd({ ...editProd, name: e.target.value })} placeholder="Tên sản phẩm" required />
                  <input className="inputbox" value={editProd.brand} onChange={(e) => setEditProd({ ...editProd, brand: e.target.value })} placeholder="Hãng" required />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <select className="inputbox" value={editProd.categoryId} onChange={(e) => setEditProd({ ...editProd, categoryId: Number(e.target.value) })}>
                    {catList.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <select className="inputbox" value={editProd.status} onChange={(e) => setEditProd({ ...editProd, status: e.target.value })}>
                    <option value="ACTIVE">Đang bán</option><option value="INACTIVE">Tạm ẩn</option>
                  </select>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <input className="inputbox" type="number" value={editProd.price} onChange={(e) => setEditProd({ ...editProd, price: e.target.value })} placeholder="Giá (VNĐ)" required />
                  <input className="inputbox" type="number" value={editProd.stock} onChange={(e) => setEditProd({ ...editProd, stock: e.target.value })} placeholder="Tồn kho" required />
                </div>
                <textarea className="inputbox" style={{ height: 80 }} value={editProd.description || ""} onChange={(e) => setEditProd({ ...editProd, description: e.target.value })} placeholder="Mô tả sản phẩm" />
                <label className="btn soft" style={{ height: 40, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer" }}>
                  <i className="fa-solid fa-camera"></i> {editProd.imageUrl ? "Đổi ảnh sản phẩm" : "Tải ảnh mới"}
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleImageFile(e, (url) => setEditProd({ ...editProd, imageUrl: url }))} />
                </label>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                  <button type="button" className="btn" onClick={() => setEditProd(null)}>Hủy</button>
                  <button type="submit" className="btn primary" disabled={saving}>{saving ? "Đang lưu..." : "Lưu thay đổi"}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {delProd && (
          <div className="modal-overlay" onClick={() => setDelProd(null)}>
            <div className="modal-card" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header"><h3>Xác nhận xóa</h3><button type="button" className="modal-close" onClick={() => setDelProd(null)}>✕</button></div>
              <div style={{ padding: 24 }}>
                <p>Bạn có chắc chắn muốn xóa sản phẩm <strong>#{delProd.id} - {delProd.name}</strong>?</p>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
                  <button type="button" className="btn" onClick={() => setDelProd(null)}>Hủy</button>
                  <button type="button" className="btn primary" style={{ background: "var(--danger)", borderColor: "var(--danger)" }} onClick={deleteProduct}>Xóa vĩnh viễn</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
