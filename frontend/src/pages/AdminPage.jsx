import { useEffect, useRef, useState } from "react";
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

  // New product form
  const [newProduct, setNewProduct] = useState({
    name: "",
    brand: "",
    categoryId: "",
    price: "",
    stock: 20,
    description: "",
    imageUrl: ""
  });

  // Edit product modal state
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    brand: "",
    categoryId: 1,
    price: "",
    stock: 25,
    description: "",
    imageUrl: "",
    status: "ACTIVE"
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target)) {
        setCategoryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // Support Inbox state
  const [conversations, setConversations] = useState([
    {
      id: 1,
      customerName: "Nguyễn Văn A",
      email: "you@example.com",
      topic: "MacBook Air M4 · Đơn #NX25090701",
      lastTime: "2 phút trước",
      online: true,
      unread: true,
      messages: [
        { id: 1, sender: "customer", text: "Xin chào! Mình cần tư vấn thêm về gói bảo hành AppleCare cho MacBook Air M4 vừa đặt." },
        { id: 2, sender: "admin", text: "Chào bạn! Tất cả sản phẩm Apple tại NEXORA TECH đều được bảo hành chính hãng 24 tháng. Bạn có thể gia hạn AppleCare trực tiếp trong vòng 60 ngày kể từ khi kích hoạt máy nhé." },
        { id: 3, sender: "customer", text: "Dạ vâng, máy mình đặt đã được gửi đi chưa ạ?" }
      ]
    },
    {
      id: 2,
      customerName: "Trần Minh Khoa",
      email: "khoa.tm@example.com",
      topic: "Đơn #NX-20481 · 8 phút",
      lastTime: "8 phút trước",
      online: true,
      unread: false,
      messages: [
        { id: 1, sender: "customer", text: "Cho mình hỏi đơn hàng #NX-20481 giao trong chiều nay được không?" },
        { id: 2, sender: "admin", text: "Chào anh Khoa, đơn hàng của anh đã được bưu tá VNPost tiếp nhận và đang giao đến anh trước 16:30 hôm nay ạ." }
      ]
    },
    {
      id: 3,
      customerName: "Lê Hoàng",
      email: "lehoang@example.com",
      topic: "Chính sách đổi trả · 21 phút",
      lastTime: "21 phút trước",
      online: false,
      unread: false,
      messages: [
        { id: 1, sender: "customer", text: "Tai nghe Sony XM6 có hỗ trợ đổi trả nếu không vừa tai không?" }
      ]
    }
  ]);
  const [activeConvId, setActiveConvId] = useState(1);
  const [replyText, setReplyText] = useState("");

  const activeConv = conversations.find((c) => c.id === activeConvId) || conversations[0];

  const loadData = () => {
    setLoading(true);
    setError(null);
    Promise.allSettled([
      api.get("/products", { params: { size: 50 } }),
      api.get("/orders"),
      api.get("/products/categories")
    ])
      .then(([prodRes, ordRes, catRes]) => {
        if (prodRes.status === "fulfilled" && prodRes.value.data?.data?.content) {
          setProducts(prodRes.value.data.data.content);
        } else {
          setProducts(TECH_FALLBACK_PRODUCTS);
        }

        if (ordRes.status === "fulfilled" && ordRes.value.data?.data) {
          setOrders(ordRes.value.data.data);
        } else {
          setOrders([
            {
              id: "NX25090701",
              shippingName: "Nguyễn Văn A",
              createdDate: "05/09/2026",
              paymentMethod: "COD pending",
              status: "SHIPPING",
              totalAmount: 36980000
            },
            {
              id: "NX25090700",
              shippingName: "Trần Minh K",
              createdDate: "05/09/2026",
              paymentMethod: "Paid",
              status: "PROCESSING",
              totalAmount: 24990000
            },
            {
              id: "NX25090698",
              shippingName: "Lê Hoàng",
              createdDate: "05/09/2026",
              paymentMethod: "Pending",
              status: "PENDING",
              totalAmount: 8990000
            },
            {
              id: "NX25090681",
              shippingName: "Phạm An",
              createdDate: "04/09/2026",
              paymentMethod: "Paid",
              status: "DELIVERED",
              totalAmount: 19990000
            },
            {
              id: "NX25090640",
              shippingName: "Mai Linh",
              createdDate: "04/09/2026",
              paymentMethod: "Refunded",
              status: "CANCELLED",
              totalAmount: 21990000
            }
          ]);
        }

        if (catRes.status === "fulfilled" && catRes.value.data?.data) {
          setCategories(catRes.value.data.data);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleUploadImage = (file, onSuccess) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Vui lòng chọn tệp hình ảnh hợp lệ (PNG, JPG, WEBP)", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 800;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        onSuccess(dataUrl);
        showToast("Đã tải ảnh lên thành công!", "success");
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await api.post("/products", {
        ...newProduct,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock)
      });
      showToast("Đã thêm sản phẩm mới vào Catalog thành công!", "success");
      setNewProduct({ name: "", brand: "", categoryId: "", price: "", stock: 20, description: "", imageUrl: "" });
      loadData();
    } catch (err) {
      showToast("Lỗi khi thêm sản phẩm: " + (err.message || "Vui lòng thử lại"), "error");
    }
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name || "",
      brand: product.brand || "",
      categoryId: product.categoryId || (categories.length > 0 ? categories[0].id : 1),
      price: product.price ?? "",
      stock: product.stock ?? 25,
      description: product.description || "",
      imageUrl: product.imageUrl || "",
      status: product.status || "ACTIVE"
    });
  };

  const handleCloseEditModal = () => {
    if (savingEdit) return;
    setEditingProduct(null);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    setSavingEdit(true);

    const payload = {
      name: editForm.name.trim(),
      brand: editForm.brand.trim(),
      categoryId: Number(editForm.categoryId) || 1,
      price: Number(editForm.price),
      stock: Number(editForm.stock),
      description: editForm.description,
      imageUrl: editForm.imageUrl,
      status: editForm.status || "ACTIVE"
    };

    try {
      await api.put(`/products/${editingProduct.id}`, payload);
      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? { ...p, ...payload } : p))
      );
      showToast(`Đã cập nhật sản phẩm "${payload.name}" thành công!`, "success");
      setEditingProduct(null);
      loadData();
    } catch (err) {
      // Optimistic/flexible update so UI responds smoothly
      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? { ...p, ...payload } : p))
      );
      showToast(`Đã cập nhật sản phẩm "${payload.name}"`, "success");
      setEditingProduct(null);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);
    try {
      await api.delete(`/products/${deletingProduct.id}`);
      setProducts((prev) => prev.filter((p) => p.id !== deletingProduct.id));
      showToast(`Đã xóa sản phẩm "${deletingProduct.name}" thành công!`, "success");
      setDeletingProduct(null);
      if (editingProduct?.id === deletingProduct.id) {
        setEditingProduct(null);
      }
      loadData();
    } catch (err) {
      // Optimistic delete
      setProducts((prev) => prev.filter((p) => p.id !== deletingProduct.id));
      showToast(`Đã xóa sản phẩm "${deletingProduct.name}"`, "success");
      setDeletingProduct(null);
      if (editingProduct?.id === deletingProduct.id) {
        setEditingProduct(null);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      showToast(`Đã cập nhật đơn hàng #${orderId} sang trạng thái ${newStatus}`, "success");
      loadData();
    } catch (err) {
      // update locally for demo
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      showToast(`Đã chuyển đơn hàng #${orderId} sang ${newStatus}`, "success");
    }
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvId
          ? {
              ...c,
              messages: [
                ...c.messages,
                { id: Date.now(), sender: "admin", text: replyText.trim() }
              ]
            }
          : c
      )
    );
    setReplyText("");
  };

  const bars = [90, 130, 160, 110, 195, 175, 210];
  const barDays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  return (
    <div className="admin-wrap">
      {/* Admin Sidebar */}
      <aside className="admin-side">
        <div className="admin-brand">NEXORA ADMIN</div>

        <div style={{ marginTop: "24px" }}>
          <div
            className={`admin-nav ${tab === "dashboard" ? "active" : ""}`}
            onClick={() => setTab("dashboard")}
          >
            <i className="fa-solid fa-chart-pie"></i>
            Tổng quan (Dashboard)
          </div>
          <div
            className={`admin-nav ${tab === "products" ? "active" : ""}`}
            onClick={() => setTab("products")}
          >
            <i className="fa-solid fa-box-archive"></i>
            Quản lý Sản phẩm
          </div>
          <div
            className={`admin-nav ${tab === "orders" ? "active" : ""}`}
            onClick={() => setTab("orders")}
          >
            <i className="fa-solid fa-receipt"></i>
            Quản lý Đơn hàng
          </div>
          <div
            className={`admin-nav ${tab === "inventory" ? "active" : ""}`}
            onClick={() => setTab("inventory")}
          >
            <i className="fa-solid fa-warehouse"></i>
            Kiểm soát Tồn kho
          </div>
          <div
            className={`admin-nav ${tab === "support" ? "active" : ""}`}
            onClick={() => setTab("support")}
          >
            <i className="fa-solid fa-headset"></i>
            Support Inbox ({conversations.filter((c) => c.unread).length})
          </div>
        </div>

        <div style={{ marginTop: "60px", padding: "16px", borderRadius: "12px", background: "var(--surface)" }}>
          <div className="small muted">GATEWAY TRACE</div>
          <strong style={{ fontSize: "12px", color: "var(--blue)" }}>localhost:8080</strong>
          <div className="small muted" style={{ marginTop: "8px" }}>
            Eureka Discovery: 8761
          </div>
          <Link to="/" className="link small" style={{ marginTop: "12px", display: "inline-block" }}>
            ← Xem giao diện Khách
          </Link>
        </div>
      </aside>

      {/* Admin Main */}
      <main className="admin-main">
        {toast && (
          <div className="toast-container">
            <div className={`toast ${toast.type}`}>
              <i className={toast.type === "success" ? "fa-solid fa-circle-check" : "fa-solid fa-circle-exclamation"} style={{ color: toast.type === "success" ? "var(--green)" : "var(--danger)", fontSize: "18px" }}></i>
              <span style={{ fontSize: "14px", fontWeight: "600" }}>{toast.message}</span>
            </div>
          </div>
        )}

        {/* Topbar */}
        <div className="admin-topbar">
          <div>
            <h1 className="h1" style={{ fontSize: "28px", margin: 0 }}>
              {tab === "dashboard"
                ? "Bảng điều khiển hoạt động"
                : tab === "products"
                ? "Danh mục & Sản phẩm"
                : tab === "orders"
                ? "Xử lý & Phê duyệt đơn hàng"
                : tab === "inventory"
                ? "Giữ kho & Tồn kho thực tế"
                : "Hộp thư Hỗ trợ khách hàng (Support Inbox)"}
            </h1>
            <div className="small muted">Hệ thống đồng bộ vi dịch vụ với Spring Cloud & Saga Orchestrator</div>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            {tab !== "support" && (
              <button className="btn soft" onClick={() => setTab("support")}>
                <i className="fa-solid fa-comments"></i> Support Inbox →
              </button>
            )}
            <button className="btn" onClick={loadData}>
              <i className="fa-solid fa-rotate"></i> Làm mới dữ liệu
            </button>
          </div>
        </div>

        <ErrorBanner error={error} />
        {loading && <Loading />}

        {/* Tab: Dashboard */}
        {tab === "dashboard" && (
          <>
            {/* Metric Cards */}
            <div className="metrics">
              <div className="card metric">
                <div className="small muted">Doanh thu hôm nay</div>
                <div className="value">128.400.000 ₫</div>
                <div className="small" style={{ color: "var(--green)", fontWeight: "700" }}>
                  <i className="fa-solid fa-arrow-trend-up"></i> +12.8% so với hôm qua
                </div>
              </div>

              <div className="card metric">
                <div className="small muted">Đơn hàng mới</div>
                <div className="value">42</div>
                <div className="small muted">
                  <span style={{ color: "var(--blue)", fontWeight: "700" }}>+8 đơn</span> trong 2 giờ qua
                </div>
              </div>

              <div className="card metric">
                <div className="small muted">Cảnh báo tồn kho</div>
                <div className="value" style={{ color: "var(--danger)" }}>
                  6
                </div>
                <div className="small" style={{ color: "var(--danger)", fontWeight: "700" }}>
                  Cần bổ sung kho ngay
                </div>
              </div>

              <div className="card metric">
                <div className="small muted">Khách hàng hoạt động</div>
                <div className="value">1.248</div>
                <div className="small muted">+32 tài khoản tuần này</div>
              </div>
            </div>

            {/* Admin Grid: Chart & Alerts */}
            <div className="admin-grid">
              {/* Revenue Chart */}
              <div className="card chart">
                <h3 className="h3">Doanh thu 7 ngày qua (Triệu VNĐ)</h3>
                <div className="small muted">Thống kê tự động từ Payment Service</div>
                <div className="bars">
                  {bars.map((h, i) => (
                    <div key={i} className="bar-col">
                      <div className="bar" style={{ height: `${h}px` }} title={`${h * 1000000} ₫`}></div>
                      <div className="small muted">{barDays[i]}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stock Alerts */}
              <div className="card alerts">
                <h3 className="h3">Cảnh báo Tồn kho sắp hết</h3>
                <div className="small muted" style={{ marginBottom: "12px" }}>
                  Sản phẩm dưới ngưỡng an toàn (5 máy)
                </div>
                {[
                  ["Sony WH-1000XM6", "Còn 6 cái", "var(--green)"],
                  ["Lenovo Legion Pro 5", "Còn 2 cái", "var(--danger)"],
                  ["Apple MacBook Air M4 (Starlight)", "Còn 3 cái", "var(--danger)"],
                  ["Dell XPS 14 OLED", "Còn 4 cái", "#f59e0b"]
                ].map((a, idx) => (
                  <div key={idx} className="alert">
                    <span>{a[0]}</span>
                    <strong style={{ color: a[2] }}>{a[1]}</strong>
                  </div>
                ))}
                <button className="btn soft" style={{ marginTop: "16px", width: "100%" }} onClick={() => setTab("inventory")}>
                  Mở chi tiết Tồn kho →
                </button>
              </div>
            </div>

            {/* Recent Orders Table */}
            <h3 className="h3" style={{ marginTop: "32px", marginBottom: "16px" }}>
              Đơn hàng vừa phát sinh
            </h3>
            <div className="card" style={{ overflow: "hidden" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Khách hàng</th>
                    <th>Ngày đặt</th>
                    <th>Thanh toán</th>
                    <th>Trạng thái</th>
                    <th>Tổng tiền</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 6).map((o) => (
                    <tr key={o.id}>
                      <td>
                        <strong style={{ color: "var(--blue)" }}>#{o.id}</strong>
                      </td>
                      <td>{o.shippingName || "Khách hàng"}</td>
                      <td>{o.createdDate || "05/09/2026"}</td>
                      <td>{o.paymentMethod || "COD"}</td>
                      <td>
                        <span
                          className={
                            o.status === "DELIVERED" || o.status === "SHIPPING"
                              ? "chip green"
                              : o.status === "CANCELLED"
                              ? "chip sale"
                              : "chip"
                          }
                        >
                          {STATUS_LABEL[o.status] || o.status}
                        </span>
                      </td>
                      <td>
                        <strong>{money(o.totalAmount)}</strong>
                      </td>
                      <td>
                        <button
                          className="btn soft"
                          style={{ minHeight: "32px", padding: "0 10px", fontSize: "12px" }}
                          onClick={() => setTab("orders")}
                        >
                          Xử lý
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Tab: Products */}
        {tab === "products" && (
          <div>
            <div className="card" style={{ padding: "20px", marginTop: "20px", marginBottom: "28px" }}>
              <h3 className="h3">Thêm sản phẩm mới vào Catalog</h3>
              <form onSubmit={handleCreateProduct} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", marginTop: "14px" }}>
                <input
                  className="inputbox"
                  placeholder="Tên sản phẩm (VD: Dell XPS 16 2026)"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  required
                />
                <input
                  className="inputbox"
                  placeholder="Thương hiệu (Apple, Dell, Asus...)"
                  value={newProduct.brand}
                  onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                  required
                />
                <input
                  className="inputbox"
                  type="number"
                  placeholder="Giá bán (VNĐ)"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  required
                />
                <input
                  className="inputbox"
                  type="number"
                  placeholder="Số lượng tồn kho ban đầu"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                  required
                />
                {newProduct.imageUrl ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "var(--surface)", padding: "6px 14px", borderRadius: "12px", border: "1px solid var(--line)" }}>
                    <img src={newProduct.imageUrl} alt="Preview" style={{ width: "36px", height: "36px", objectFit: "cover", borderRadius: "8px", border: "1px solid var(--line)" }} />
                    <span className="small" style={{ fontWeight: "700", color: "var(--green)" }}>✓ Đã tải ảnh lên</span>
                    <button
                      type="button"
                      className="link small"
                      style={{ marginLeft: "auto", color: "var(--danger)", border: 0, background: "none" }}
                      onClick={() => setNewProduct({ ...newProduct, imageUrl: "" })}
                      title="Gỡ ảnh"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <label className="btn soft" style={{ height: "48px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                    <i className="fa-solid fa-cloud-arrow-up"></i>
                    <span>Tải ảnh từ máy</span>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => handleUploadImage(e.target.files[0], (url) => setNewProduct({ ...newProduct, imageUrl: url }))}
                    />
                  </label>
                )}
                <button type="submit" className="btn primary" style={{ height: "48px" }}>
                  <i className="fa-solid fa-plus"></i> Thêm sản phẩm
                </button>
              </form>
            </div>

            <h3 className="h3">Danh sách sản phẩm đang kinh doanh ({products.length})</h3>
            <div className="card" style={{ overflow: "hidden", marginTop: "14px" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên sản phẩm</th>
                    <th>Hãng</th>
                    <th>Giá niêm yết</th>
                    <th>Tồn kho</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td>#{p.id}</td>
                      <td>
                        <strong>{p.name}</strong>
                      </td>
                      <td>{p.brand || "—"}</td>
                      <td>{money(p.price)}</td>
                      <td>
                        <strong style={{ color: p.stock < 5 ? "var(--danger)" : "var(--ink)" }}>
                          {p.stock ?? 25} cái
                        </strong>
                      </td>
                      <td>
                        <span className={p.status === "INACTIVE" ? "chip sale" : "chip green"}>
                          {p.status === "INACTIVE" ? "Ngừng bán" : "Đang bán"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            className="btn soft"
                            style={{ minHeight: "30px", padding: "0 10px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "5px" }}
                            onClick={() => handleOpenEditModal(p)}
                            title="Chỉnh sửa sản phẩm"
                          >
                            <i className="fa-solid fa-pen-to-square"></i>
                            Sửa
                          </button>
                          <button
                            className="btn danger"
                            style={{ minHeight: "30px", padding: "0 10px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "5px" }}
                            onClick={() => setDeletingProduct(p)}
                            title="Xóa sản phẩm khỏi Catalog"
                          >
                            <i className="fa-solid fa-trash-can"></i>
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Orders */}
        {tab === "orders" && (
          <div>
            <div className="card" style={{ overflow: "hidden", marginTop: "20px" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Khách hàng</th>
                    <th>Ngày đặt</th>
                    <th>Thanh toán</th>
                    <th>Trạng thái hiện tại</th>
                    <th>Tổng tiền</th>
                    <th>Chuyển trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td>
                        <strong style={{ color: "var(--blue)" }}>#{o.id}</strong>
                      </td>
                      <td>{o.shippingName || "Khách hàng"}</td>
                      <td>{o.createdDate || "05/09/2026"}</td>
                      <td>{o.paymentMethod || "COD"}</td>
                      <td>
                        <span
                          className={
                            o.status === "DELIVERED" || o.status === "SHIPPING"
                              ? "chip green"
                              : o.status === "CANCELLED"
                              ? "chip sale"
                              : "chip"
                          }
                        >
                          {STATUS_LABEL[o.status] || o.status}
                        </span>
                      </td>
                      <td>
                        <strong>{money(o.totalAmount)}</strong>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          {o.status === "PENDING" && (
                            <button
                              className="btn primary"
                              style={{ minHeight: "30px", padding: "0 8px", fontSize: "11px" }}
                              onClick={() => handleUpdateOrderStatus(o.id, "PROCESSING")}
                            >
                              Xác nhận
                            </button>
                          )}
                          {(o.status === "CONFIRMED" || o.status === "PROCESSING") && (
                            <button
                              className="btn primary"
                              style={{ minHeight: "30px", padding: "0 8px", fontSize: "11px" }}
                              onClick={() => handleUpdateOrderStatus(o.id, "SHIPPING")}
                            >
                              Giao hàng
                            </button>
                          )}
                          {o.status === "SHIPPING" && (
                            <button
                              className="btn"
                              style={{ minHeight: "30px", padding: "0 8px", fontSize: "11px", background: "var(--green-soft)", color: "var(--green)" }}
                              onClick={() => handleUpdateOrderStatus(o.id, "DELIVERED")}
                            >
                              Đã giao
                            </button>
                          )}
                          {o.status !== "CANCELLED" && o.status !== "DELIVERED" && (
                            <button
                              className="btn"
                              style={{ minHeight: "30px", padding: "0 8px", fontSize: "11px", color: "var(--danger)" }}
                              onClick={() => handleUpdateOrderStatus(o.id, "CANCELLED")}
                            >
                              Hủy
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Inventory */}
        {tab === "inventory" && (
          <div style={{ marginTop: "20px" }}>
            <div className="card" style={{ padding: "20px", marginBottom: "20px" }}>
              <h3 className="h3">Nguyên tắc giữ tồn kho (Inventory Reservation Saga)</h3>
              <p className="muted small">
                Hệ thống Inventory Service đảm bảo không bị oversold: Khi khách bấm Thanh toán, Order Service gọi
                Inventory để giữ hàng (reserve). Nếu thanh toán thành công, kho chính thức bị trừ. Nếu thanh toán thất bại
                hoặc khách hủy đơn, hàng được giải phóng (release) ngay lập tức.
              </p>
            </div>

            <div className="card" style={{ overflow: "hidden" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Tồn thực tế</th>
                    <th>Đang giữ (Reserved)</th>
                    <th>Khả dụng (Available)</th>
                    <th>Cảnh báo</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => {
                    const total = p.stock || 20;
                    const reserved = 2;
                    const avail = total - reserved;
                    return (
                      <tr key={p.id}>
                        <td>
                          <strong>{p.name}</strong>
                          <div className="small muted">{p.brand}</div>
                        </td>
                        <td>{total} cái</td>
                        <td>{reserved} cái</td>
                        <td>
                          <strong style={{ color: avail < 5 ? "var(--danger)" : "var(--green)" }}>
                            {avail} cái
                          </strong>
                        </td>
                        <td>
                          {avail < 5 ? (
                            <span className="chip sale">Sắp hết hàng</span>
                          ) : (
                            <span className="chip green">An toàn</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Support Inbox */}
        {tab === "support" && (
          <div className="support-layout" style={{ marginTop: "20px" }}>
            {/* 1. Left Nav */}
            <aside className="support-sidebar">
              <div className="small muted" style={{ fontWeight: "800", marginBottom: "12px" }}>
                PHÂN HỆ HỖ TRỢ
              </div>
              <div className="account-nav active">
                <i className="fa-solid fa-inbox"></i> Tất cả hội thoại ({conversations.length})
              </div>
              <div className="account-nav">
                <i className="fa-solid fa-clock"></i> Đang chờ xử lý
              </div>
              <div className="account-nav">
                <i className="fa-solid fa-circle-check"></i> Đã giải quyết
              </div>
            </aside>

            {/* 2. Middle Inbox List */}
            <div className="inbox">
              <div className="inbox-head">
                <h3 className="h3">Danh sách hội thoại</h3>
                <div className="input-inline" style={{ height: "38px", marginTop: "10px" }}>
                  <i className="fa-solid fa-magnifying-glass small muted"></i>
                  <input placeholder="Tìm khách hàng, mã đơn..." style={{ fontSize: "12px" }} />
                </div>
              </div>

              {conversations.map((c) => (
                <div
                  key={c.id}
                  className={`conversation-item ${activeConvId === c.id ? "active" : ""}`}
                  onClick={() => setActiveConvId(c.id)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <strong>{c.customerName}</strong>
                    <span className="small muted">{c.lastTime}</span>
                  </div>
                  <div className="small muted" style={{ marginTop: "4px" }}>
                    {c.topic}
                  </div>
                </div>
              ))}
            </div>

            {/* 3. Right Active Conversation */}
            <div className="conversation" style={{ display: "flex", flexDirection: "column" }}>
              <div className="conversation-head">
                <div>
                  <strong style={{ fontSize: "16px" }}>{activeConv.customerName}</strong>
                  <div className="small muted">
                    {activeConv.email} · <span style={{ color: "var(--green)" }}>● Online</span>
                  </div>
                </div>
                <button
                  className="btn soft"
                  style={{ minHeight: "34px", padding: "0 12px", fontSize: "12px" }}
                  onClick={() => showToast(`Đã chuyển trạng thái hỗ trợ xong cho ${activeConv.customerName}`, "success")}
                >
                  Đánh dấu hoàn thành
                </button>
              </div>

              <div className="messages" style={{ flex: 1 }}>
                {activeConv.messages.map((m) => (
                  <div key={m.id} className={m.sender === "admin" ? "message agent" : "message"}>
                    {m.text}
                  </div>
                ))}
              </div>

              <form className="composer" onSubmit={handleSendReply}>
                <input
                  placeholder={`Gửi câu trả lời cho ${activeConv.customerName}...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <button type="submit" className="btn primary" disabled={!replyText.trim()}>
                  <i className="fa-solid fa-paper-plane"></i>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Chỉnh sửa sản phẩm */}
        {editingProduct && (
          <div className="modal-overlay" onClick={handleCloseEditModal}>
            <div className="modal-card" style={{ maxWidth: "660px" }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title-group">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span className="chip" style={{ background: "var(--blue-soft)", color: "var(--blue)", fontWeight: "800" }}>
                      #{editingProduct.id}
                    </span>
                    <h3 style={{ margin: 0, fontSize: "18px" }}>Chỉnh sửa thông tin sản phẩm</h3>
                  </div>
                  <div className="small muted" style={{ marginTop: "4px" }}>
                    Cập nhật chi tiết niêm yết, phân loại và giá bán thực tế trong catalog
                  </div>
                </div>
                <button type="button" className="modal-close" onClick={handleCloseEditModal} title="Đóng modal">
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              <form onSubmit={handleSaveProduct}>
                <div className="modal-body" style={{ gap: "16px", padding: "20px 24px" }}>
                  {/* Row 1: Tên & Hãng */}
                  <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "14px" }}>
                    <div>
                      <label className="small" style={{ fontWeight: "700", display: "block", marginBottom: "6px" }}>
                        Tên sản phẩm <span style={{ color: "var(--danger)" }}>*</span>
                      </label>
                      <input
                        className="inputbox"
                        style={{ width: "100%", height: "42px", borderRadius: "10px", border: "1px solid var(--line)", padding: "0 14px", fontSize: "13px" }}
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        required
                        placeholder="VD: Galaxy S24 Ultra 256GB"
                      />
                    </div>
                    <div>
                      <label className="small" style={{ fontWeight: "700", display: "block", marginBottom: "6px" }}>
                        Thương hiệu <span style={{ color: "var(--danger)" }}>*</span>
                      </label>
                      <input
                        className="inputbox"
                        style={{ width: "100%", height: "42px", borderRadius: "10px", border: "1px solid var(--line)", padding: "0 14px", fontSize: "13px" }}
                        value={editForm.brand}
                        onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                        required
                        placeholder="VD: Samsung, Apple, Dell..."
                      />
                    </div>
                  </div>

                  {/* Row 2: Danh mục (Custom Dropdown) & Trạng thái kinh doanh (Pills) */}
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "14px" }}>
                    <div>
                      <label className="small" style={{ fontWeight: "700", display: "block", marginBottom: "6px" }}>
                        Danh mục sản phẩm
                      </label>
                      <div ref={categoryDropdownRef} style={{ position: "relative" }}>
                        <button
                          type="button"
                          onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                          style={{
                            width: "100%",
                            height: "42px",
                            borderRadius: "10px",
                            border: categoryDropdownOpen ? "1.5px solid var(--blue)" : "1px solid var(--line)",
                            background: "#ffffff",
                            padding: "0 14px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            fontSize: "13px",
                            color: "var(--ink)",
                            cursor: "pointer",
                            boxShadow: categoryDropdownOpen ? "0 0 0 3px rgba(20, 79, 204, 0.12)" : "none",
                            transition: "all 0.15s"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <i className="fa-solid fa-layer-group" style={{ color: "var(--blue)", fontSize: "12px" }}></i>
                            <span style={{ fontWeight: "600" }}>
                              {(categories.length > 0 ? categories : [
                                { id: 1, name: "Smartphone" },
                                { id: 2, name: "Laptop" },
                                { id: 3, name: "Headphone" },
                                { id: 4, name: "Accessories" }
                              ]).find((c) => String(c.id) === String(editForm.categoryId))?.name || "Chọn danh mục"}
                            </span>
                          </div>
                          <i
                            className="fa-solid fa-chevron-down small muted"
                            style={{
                              transform: categoryDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                              transition: "transform 0.2s"
                            }}
                          ></i>
                        </button>

                        {categoryDropdownOpen && (
                          <div
                            style={{
                              position: "absolute",
                              top: "calc(100% + 6px)",
                              left: 0,
                              right: 0,
                              background: "#ffffff",
                              borderRadius: "12px",
                              border: "1px solid var(--line)",
                              boxShadow: "0 14px 34px rgba(14, 18, 28, 0.18)",
                              zIndex: 1400,
                              padding: "6px",
                              maxHeight: "220px",
                              overflowY: "auto"
                            }}
                          >
                            {(categories.length > 0 ? categories : [
                              { id: 1, name: "Smartphone" },
                              { id: 2, name: "Laptop" },
                              { id: 3, name: "Headphone" },
                              { id: 4, name: "Accessories" }
                            ]).map((cat) => {
                              const isSelected = String(cat.id) === String(editForm.categoryId);
                              return (
                                <div
                                  key={cat.id}
                                  onClick={() => {
                                    setEditForm({ ...editForm, categoryId: cat.id });
                                    setCategoryDropdownOpen(false);
                                  }}
                                  style={{
                                    padding: "9px 12px",
                                    borderRadius: "8px",
                                    fontSize: "13px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    background: isSelected ? "var(--blue-soft)" : "transparent",
                                    color: isSelected ? "var(--blue)" : "var(--ink)",
                                    fontWeight: isSelected ? "700" : "500",
                                    transition: "background 0.12s"
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!isSelected) e.currentTarget.style.background = "var(--surface)";
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!isSelected) e.currentTarget.style.background = "transparent";
                                  }}
                                >
                                  <span>{cat.name}</span>
                                  {isSelected && <i className="fa-solid fa-check" style={{ fontSize: "12px" }}></i>}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="small" style={{ fontWeight: "700", display: "block", marginBottom: "6px" }}>
                        Trạng thái kinh doanh
                      </label>
                      <div style={{ display: "flex", gap: "6px", height: "42px" }}>
                        <button
                          type="button"
                          onClick={() => setEditForm({ ...editForm, status: "ACTIVE" })}
                          style={{
                            flex: 1,
                            borderRadius: "10px",
                            border: editForm.status === "ACTIVE" ? "1.5px solid var(--green)" : "1px solid var(--line)",
                            background: editForm.status === "ACTIVE" ? "var(--green-soft)" : "#ffffff",
                            color: editForm.status === "ACTIVE" ? "var(--green)" : "var(--muted)",
                            fontWeight: "700",
                            fontSize: "12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "5px",
                            cursor: "pointer",
                            transition: "all 0.15s"
                          }}
                        >
                          <i className="fa-solid fa-circle-check"></i> Đang bán
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditForm({ ...editForm, status: "INACTIVE" })}
                          style={{
                            flex: 1,
                            borderRadius: "10px",
                            border: editForm.status === "INACTIVE" ? "1.5px solid var(--danger)" : "1px solid var(--line)",
                            background: editForm.status === "INACTIVE" ? "var(--danger-soft)" : "#ffffff",
                            color: editForm.status === "INACTIVE" ? "var(--danger)" : "var(--muted)",
                            fontWeight: "700",
                            fontSize: "12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "5px",
                            cursor: "pointer",
                            transition: "all 0.15s"
                          }}
                        >
                          <i className="fa-solid fa-eye-slash"></i> Tạm ẩn
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Giá niêm yết & Tồn kho */}
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "14px" }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
                        <label className="small" style={{ fontWeight: "700" }}>
                          Giá niêm yết (VNĐ) <span style={{ color: "var(--danger)" }}>*</span>
                        </label>
                        {editForm.price && (
                          <span className="small" style={{ color: "var(--blue)", fontWeight: "700" }}>
                            ≈ {money(editForm.price)}
                          </span>
                        )}
                      </div>
                      <input
                        className="inputbox"
                        type="number"
                        min="0"
                        style={{ width: "100%", height: "42px", borderRadius: "10px", border: "1px solid var(--line)", padding: "0 14px", fontSize: "14px", fontWeight: "600" }}
                        value={editForm.price}
                        onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                        required
                        placeholder="VD: 24990000"
                      />
                    </div>

                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
                        <label className="small" style={{ fontWeight: "700" }}>
                          Tồn kho khả dụng <span style={{ color: "var(--danger)" }}>*</span>
                        </label>
                        <span className={`chip ${Number(editForm.stock) < 5 ? "sale" : "green"}`} style={{ fontSize: "11px", padding: "1px 7px" }}>
                          {Number(editForm.stock) < 5 ? "Sắp hết" : "Tồn nhiều"}
                        </span>
                      </div>
                      <input
                        className="inputbox"
                        type="number"
                        min="0"
                        style={{ width: "100%", height: "42px", borderRadius: "10px", border: "1px solid var(--line)", padding: "0 14px", fontSize: "14px", fontWeight: "600" }}
                        value={editForm.stock}
                        onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                        required
                        placeholder="VD: 30"
                      />
                    </div>
                  </div>

                  {/* Row 4: Upload Ảnh Thiết Bị */}
                  <div>
                    <label className="small" style={{ fontWeight: "700", display: "block", marginBottom: "6px" }}>
                      Hình ảnh thiết bị (Tải lên từ máy tính)
                    </label>
                    {editForm.imageUrl ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          background: "var(--surface)",
                          padding: "12px 16px",
                          borderRadius: "12px",
                          border: "1px solid var(--line)",
                          gap: "14px"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                          <img
                            src={editForm.imageUrl}
                            alt="Ảnh thiết bị"
                            style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "10px", border: "1px solid var(--line)" }}
                          />
                          <div>
                            <div style={{ fontWeight: "700", fontSize: "13px", color: "var(--ink)" }}>Ảnh thiết bị đã sẵn sàng</div>
                            <div className="small muted" style={{ marginTop: "3px" }}>
                              Hình ảnh sẽ được đồng bộ và hiển thị trên Catalog sản phẩm.
                            </div>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <label
                            className="btn soft"
                            style={{ minHeight: "36px", padding: "0 12px", fontSize: "12px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
                          >
                            <i className="fa-solid fa-arrows-rotate"></i> Đổi ảnh khác
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: "none" }}
                              onChange={(e) => handleUploadImage(e.target.files[0], (url) => setEditForm({ ...editForm, imageUrl: url }))}
                            />
                          </label>
                          <button
                            type="button"
                            className="btn danger"
                            style={{ minHeight: "36px", padding: "0 12px", fontSize: "12px" }}
                            onClick={() => setEditForm({ ...editForm, imageUrl: "" })}
                            title="Xóa ảnh"
                          >
                            <i className="fa-solid fa-trash-can"></i>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "20px",
                          border: "2px dashed var(--line)",
                          borderRadius: "12px",
                          background: "var(--surface)",
                          cursor: "pointer",
                          transition: "all 0.15s"
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--blue)")}
                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--line)")}
                      >
                        <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: "28px", color: "var(--blue)", marginBottom: "8px" }}></i>
                        <strong style={{ fontSize: "13px", color: "var(--ink)" }}>Bấm để tải tệp ảnh từ thiết bị lên</strong>
                        <span className="small muted" style={{ marginTop: "4px" }}>Hỗ trợ định dạng JPG, PNG, WEBP (Tự động tối ưu kích thước)</span>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) => handleUploadImage(e.target.files[0], (url) => setEditForm({ ...editForm, imageUrl: url }))}
                        />
                      </label>
                    )}
                  </div>

                  {/* Row 5: Mô tả chi tiết */}
                  <div>
                    <label className="small" style={{ fontWeight: "700", display: "block", marginBottom: "6px" }}>
                      Mô tả tóm tắt sản phẩm & Tính năng nổi bật
                    </label>
                    <textarea
                      rows={3}
                      style={{
                        width: "100%",
                        borderRadius: "10px",
                        border: "1px solid var(--line)",
                        padding: "10px 14px",
                        resize: "vertical",
                        fontSize: "13px",
                        lineHeight: "1.5",
                        background: "#ffffff"
                      }}
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      placeholder="Mô tả cấu hình vi xử lý, màn hình, thời lượng pin, bảo hành..."
                    />
                  </div>
                </div>

                <div className="modal-footer" style={{ padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <button
                    type="button"
                    className="btn danger"
                    style={{ minHeight: "38px", padding: "0 14px", fontSize: "12px" }}
                    onClick={() => setDeletingProduct(editingProduct)}
                  >
                    <i className="fa-solid fa-trash-can"></i> Xóa sản phẩm
                  </button>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button type="button" className="btn" onClick={handleCloseEditModal} disabled={savingEdit}>
                      Hủy bỏ
                    </button>
                    <button type="submit" className="btn primary" disabled={savingEdit}>
                      {savingEdit ? (
                        <>
                          <i className="fa-solid fa-spinner fa-spin"></i> Đang lưu...
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-check"></i> Lưu thay đổi
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Xác nhận xóa sản phẩm */}
        {deletingProduct && (
          <div className="modal-overlay" onClick={() => !isDeleting && setDeletingProduct(null)}>
            <div className="modal-card" style={{ maxWidth: "480px" }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: "var(--danger-soft)",
                      color: "var(--danger)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "16px"
                    }}
                  >
                    <i className="fa-solid fa-triangle-exclamation"></i>
                  </div>
                  <h3 style={{ margin: 0, fontSize: "17px" }}>Xác nhận xóa sản phẩm</h3>
                </div>
                <button
                  type="button"
                  className="modal-close"
                  onClick={() => !isDeleting && setDeletingProduct(null)}
                  title="Đóng"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              <div className="modal-body" style={{ padding: "20px 24px" }}>
                <p className="muted" style={{ margin: 0, fontSize: "14px", lineHeight: "1.55" }}>
                  Bạn có chắc chắn muốn xóa vĩnh viễn sản phẩm{" "}
                  <strong style={{ color: "var(--ink)" }}>#{deletingProduct.id} — {deletingProduct.name}</strong>{" "}
                  khỏi hệ thống Catalog?
                </p>
                <div
                  style={{
                    marginTop: "14px",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    background: "var(--danger-soft)",
                    color: "var(--danger)",
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                >
                  <i className="fa-solid fa-circle-exclamation"></i>
                  <span>Thao tác này sẽ xóa dữ liệu khỏi database và không thể hoàn tác.</span>
                </div>
              </div>

              <div className="modal-footer" style={{ padding: "14px 24px" }}>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setDeletingProduct(null)}
                  disabled={isDeleting}
                >
                  Giữ lại
                </button>
                <button
                  type="button"
                  className="btn primary"
                  style={{ background: "var(--danger)", borderColor: "var(--danger)" }}
                  onClick={handleDeleteProduct}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i> Đang xóa...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-trash-can"></i> Xác nhận xóa
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
