import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("notifications");
  const [form, setForm] = useState({
    fullName: user?.fullName || "Demo Customer",
    email: user?.email || "customer@example.com",
    phone: "0901 234 567",
    dob: "2000-01-15",
    gender: "male"
  });

  const [addresses, setAddresses] = useState([
    {
      id: 1,
      name: "Demo Customer",
      phone: "0901 234 567",
      type: "Nhà riêng",
      detail: "12 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
      isDefault: true
    },
    {
      id: 2,
      name: "Demo Customer",
      phone: "0901 234 567",
      type: "Văn phòng",
      detail: "Tòa nhà Landmark 81, 720A Điện Biên Phủ, Phường 22, Quận Bình Thạnh, TP. Hồ Chí Minh",
      isDefault: false
    }
  ]);

  const [notifications, setNotifications] = useState({
    orderEmail: true,
    sms2h: true,
    promo: true,
    security: true
  });

  const [savedMessage, setSavedMessage] = useState("");
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    name: "",
    phone: "",
    type: "Nhà riêng",
    city: "TP. Hồ Chí Minh",
    detail: "",
    isDefault: false
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);

  const notifySaved = (msg) => {
    setSavedMessage(msg);
    setTimeout(() => setSavedMessage(""), 3000);
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    notifySaved("Đã cập nhật thông tin hồ sơ thành công!");
  };

  const handlePasswordSave = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    notifySaved("Đã đổi mật khẩu tài khoản thành công!");
  };

  const handleNotifSave = () => {
    notifySaved("Đã lưu tùy chọn thông báo thành công!");
  };

  const openAddressModal = (addr = null) => {
    if (addr) {
      setEditingAddressId(addr.id);
      setAddressForm({
        name: addr.name,
        phone: addr.phone,
        type: addr.type,
        city: "TP. Hồ Chí Minh",
        detail: addr.detail,
        isDefault: addr.isDefault
      });
    } else {
      setEditingAddressId(null);
      setAddressForm({
        name: form.fullName,
        phone: form.phone,
        type: "Nhà riêng",
        city: "TP. Hồ Chí Minh",
        detail: "",
        isDefault: addresses.length === 0
      });
    }
    setShowAddressModal(true);
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (editingAddressId) {
      setAddresses((prev) =>
        prev.map((item) =>
          item.id === editingAddressId
            ? {
                ...item,
                name: addressForm.name,
                phone: addressForm.phone,
                type: addressForm.type,
                detail: addressForm.detail,
                isDefault: addressForm.isDefault ? true : item.isDefault
              }
            : addressForm.isDefault
            ? { ...item, isDefault: false }
            : item
        )
      );
      notifySaved("Đã cập nhật địa chỉ nhận hàng!");
    } else {
      const newAddr = {
        id: Date.now(),
        name: addressForm.name,
        phone: addressForm.phone,
        type: addressForm.type,
        detail: addressForm.detail,
        isDefault: addressForm.isDefault || addresses.length === 0
      };
      setAddresses((prev) =>
        addressForm.isDefault ? [...prev.map((a) => ({ ...a, isDefault: false })), newAddr] : [...prev, newAddr]
      );
      notifySaved("Đã thêm địa chỉ nhận hàng mới!");
    }
    setShowAddressModal(false);
  };

  const setDefaultAddress = (id) => {
    setAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        isDefault: addr.id === id
      }))
    );
    notifySaved("Đã đổi địa chỉ mặc định!");
  };

  const deleteAddress = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) {
      setAddresses((prev) => prev.filter((addr) => addr.id !== id));
      notifySaved("Đã xóa địa chỉ thành công!");
    }
  };

  const initials = form.fullName
    ? form.fullName
        .split(" ")
        .slice(-2)
        .map((w) => w.charAt(0))
        .join("")
        .toUpperCase()
    : "DC";

  return (
    <div className="page">
      <div className="account-page-wrap">
        <div className="account-header-hero">
          <h1 className="h1">Tài khoản của tôi</h1>
          <p className="muted" style={{ margin: 0 }}>
            Quản lý hồ sơ cá nhân, sổ địa chỉ nhận hàng và tùy chọn bảo mật tài khoản.
          </p>
        </div>

        {savedMessage && (
          <div className="banner ok" style={{ animation: "slideIn 0.2s ease-out" }}>
            <i className="fa-solid fa-circle-check"></i>
            {savedMessage}
          </div>
        )}

        <div className="account-layout">
          {/* Sidebar */}
          <aside className="account-side">
            <div className="account-user-summary">
              <div className="account-user-avatar">
                {initials}
                <div className="account-user-avatar-badge" title="Tài khoản đã xác thực">
                  <i className="fa-solid fa-check"></i>
                </div>
              </div>
              <h3 className="account-user-name">{form.fullName}</h3>
              <p className="account-user-email">{form.email}</p>
              <span className="chip green" style={{ fontSize: "11px", gap: "4px" }}>
                <i className="fa-solid fa-shield-check"></i> Thành viên Nexora
              </span>
            </div>

            <nav className="account-nav-list">
              <div
                className={`account-nav ${activeTab === "profile" ? "active" : ""}`}
                onClick={() => setActiveTab("profile")}
              >
                <i className="fa-solid fa-user"></i>
                <span>Hồ sơ cá nhân</span>
              </div>
              <div
                className={`account-nav ${activeTab === "address" ? "active" : ""}`}
                onClick={() => setActiveTab("address")}
              >
                <i className="fa-solid fa-location-dot"></i>
                <span>Sổ địa chỉ nhận hàng</span>
              </div>
              <div
                className={`account-nav ${activeTab === "password" ? "active" : ""}`}
                onClick={() => setActiveTab("password")}
              >
                <i className="fa-solid fa-key"></i>
                <span>Đổi mật khẩu</span>
              </div>
              <div
                className={`account-nav ${activeTab === "notifications" ? "active" : ""}`}
                onClick={() => setActiveTab("notifications")}
              >
                <i className="fa-solid fa-bell"></i>
                <span>Cài đặt thông báo</span>
              </div>

              <div className="account-nav-divider"></div>

              <div className="account-nav" onClick={() => navigate("/orders")}>
                <i className="fa-solid fa-box"></i>
                <span>Lịch sử đơn hàng</span>
              </div>

              <div
                className="account-nav account-nav-danger"
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
              >
                <i className="fa-solid fa-arrow-right-from-bracket"></i>
                <span>Đăng xuất</span>
              </div>
            </nav>
          </aside>

          {/* Main Content Area */}
          <div className="account-main-card">
            {/* Tab: Notifications */}
            {activeTab === "notifications" && (
              <div>
                <div className="account-card-header">
                  <div>
                    <h2 className="account-card-title">Cài đặt nhận tin & Thông báo</h2>
                    <p className="account-card-desc">Tùy chọn kênh và tần suất nhận thông báo từ Nexora Tech</p>
                  </div>
                </div>

                <div className="account-card-body">
                  {/* Option 1: Order Email */}
                  <div
                    className="notif-option-card"
                    onClick={() => setNotifications({ ...notifications, orderEmail: !notifications.orderEmail })}
                  >
                    <div className="notif-icon-box">
                      <i className="fa-solid fa-envelope-open-text"></i>
                    </div>
                    <div className="notif-content">
                      <div className="notif-title">
                        <span>Cập nhật trạng thái đơn hàng qua Email</span>
                        <span className="notif-badge">Quan trọng</span>
                      </div>
                      <p className="notif-desc">
                        Tự động gửi email thông báo khi đơn hàng được xác nhận, bàn giao cho bưu tá và giao thành công.
                      </p>
                    </div>
                    <div className={`notif-switch ${notifications.orderEmail ? "active" : ""}`}>
                      <div className="notif-switch-knob"></div>
                    </div>
                  </div>

                  {/* Option 2: SMS 2H */}
                  <div
                    className="notif-option-card"
                    onClick={() => setNotifications({ ...notifications, sms2h: !notifications.sms2h })}
                  >
                    <div className="notif-icon-box">
                      <i className="fa-solid fa-bolt"></i>
                    </div>
                    <div className="notif-content">
                      <div className="notif-title">
                        <span>Thông báo SMS giao hàng hỏa tốc 2H</span>
                        <span className="notif-badge">Hỏa tốc</span>
                      </div>
                      <p className="notif-desc">
                        Nhận tin nhắn SMS và link theo dõi trực tiếp vị trí tài xế giao hàng khi hàng bắt đầu lăn bánh.
                      </p>
                    </div>
                    <div className={`notif-switch ${notifications.sms2h ? "active" : ""}`}>
                      <div className="notif-switch-knob"></div>
                    </div>
                  </div>

                  {/* Option 3: Promo & Voucher */}
                  <div
                    className="notif-option-card"
                    onClick={() => setNotifications({ ...notifications, promo: !notifications.promo })}
                  >
                    <div className="notif-icon-box">
                      <i className="fa-solid fa-tag"></i>
                    </div>
                    <div className="notif-content">
                      <div className="notif-title">
                        <span>Bản tin khuyến mãi & Voucher công nghệ độc quyền</span>
                        <span className="notif-badge">Ưu đãi</span>
                      </div>
                      <p className="notif-desc">
                        Nhận thông báo sớm các đợt Flash Sale chớp nhoáng, mã giảm giá từ Apple, Dell, Asus, Sony dành riêng cho bạn.
                      </p>
                    </div>
                    <div className={`notif-switch ${notifications.promo ? "active" : ""}`}>
                      <div className="notif-switch-knob"></div>
                    </div>
                  </div>

                  {/* Option 4: Security */}
                  <div
                    className="notif-option-card"
                    onClick={() => setNotifications({ ...notifications, security: !notifications.security })}
                  >
                    <div className="notif-icon-box">
                      <i className="fa-solid fa-shield-halved"></i>
                    </div>
                    <div className="notif-content">
                      <div className="notif-title">
                        <span>Cảnh báo bảo mật tài khoản</span>
                        <span className="notif-badge">Bảo mật</span>
                      </div>
                      <p className="notif-desc">
                        Nhận cảnh báo tức thời khi phát hiện lượt đăng nhập từ thiết bị lạ hoặc có thay đổi thông tin mật khẩu.
                      </p>
                    </div>
                    <div className={`notif-switch ${notifications.security ? "active" : ""}`}>
                      <div className="notif-switch-knob"></div>
                    </div>
                  </div>

                  <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--line)", display: "flex", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      className="btn primary"
                      style={{ minHeight: "44px", padding: "0 28px" }}
                      onClick={handleNotifSave}
                    >
                      <i className="fa-solid fa-check"></i> Lưu cài đặt thông báo
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Profile */}
            {activeTab === "profile" && (
              <div>
                <div className="account-card-header">
                  <div>
                    <h2 className="account-card-title">Hồ sơ cá nhân</h2>
                    <p className="account-card-desc">Quản lý thông tin hồ sơ để bảo mật và thanh toán tiện lợi</p>
                  </div>
                </div>

                <div className="account-card-body">
                  <form onSubmit={handleProfileSave}>
                    <div className="form-grid">
                      <div className="field">
                        <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "8px" }}>
                          Họ và tên
                        </label>
                        <input
                          className="inputbox"
                          value={form.fullName}
                          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                          required
                          placeholder="Nhập họ và tên"
                        />
                      </div>

                      <div className="field">
                        <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "8px" }}>
                          Địa chỉ Email
                        </label>
                        <input
                          type="email"
                          className="inputbox"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          required
                          placeholder="example@domain.com"
                        />
                      </div>

                      <div className="field">
                        <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "8px" }}>
                          Số điện thoại
                        </label>
                        <input
                          className="inputbox"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          required
                          placeholder="09xx xxx xxx"
                        />
                      </div>

                      <div className="field">
                        <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "8px" }}>
                          Ngày sinh
                        </label>
                        <input
                          type="date"
                          className="inputbox"
                          value={form.dob}
                          onChange={(e) => setForm({ ...form, dob: e.target.value })}
                        />
                      </div>

                      <div className="field" style={{ gridColumn: "1 / -1" }}>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "8px" }}>
                          Giới tính
                        </label>
                        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
                          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px" }}>
                            <input
                              type="radio"
                              name="gender"
                              checked={form.gender === "male"}
                              onChange={() => setForm({ ...form, gender: "male" })}
                            />
                            Nam
                          </label>
                          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px" }}>
                            <input
                              type="radio"
                              name="gender"
                              checked={form.gender === "female"}
                              onChange={() => setForm({ ...form, gender: "female" })}
                            />
                            Nữ
                          </label>
                          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px" }}>
                            <input
                              type="radio"
                              name="gender"
                              checked={form.gender === "other"}
                              onChange={() => setForm({ ...form, gender: "other" })}
                            />
                            Khác
                          </label>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: "32px", borderTop: "1px solid var(--line)", paddingTop: "20px", display: "flex", justifyContent: "flex-end" }}>
                      <button
                        type="submit"
                        className="btn primary"
                        style={{ minHeight: "44px", padding: "0 28px" }}
                      >
                        <i className="fa-solid fa-check"></i> Lưu thay đổi hồ sơ
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Tab: Addresses */}
            {activeTab === "address" && (
              <div>
                <div className="account-card-header">
                  <div>
                    <h2 className="account-card-title">Sổ địa chỉ nhận hàng</h2>
                    <p className="account-card-desc">Quản lý các địa chỉ giao hàng để đặt hàng nhanh chóng</p>
                  </div>
                  <button
                    type="button"
                    className="btn primary"
                    style={{ minHeight: "38px", padding: "0 16px", fontSize: "13px" }}
                    onClick={() => openAddressModal()}
                  >
                    <i className="fa-solid fa-plus"></i> Thêm địa chỉ mới
                  </button>
                </div>

                <div className="account-card-body">
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="card address"
                        style={{
                          margin: 0,
                          padding: "20px",
                          borderLeft: addr.isDefault ? "4px solid var(--blue)" : "1px solid var(--line)",
                          background: addr.isDefault ? "linear-gradient(90deg, rgba(20,79,204,0.02) 0%, #ffffff 100%)" : "#ffffff"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <strong style={{ fontSize: "15px", color: "var(--ink)" }}>{addr.name}</strong>
                              <span className="chip" style={{ fontSize: "11px", padding: "2px 8px" }}>{addr.type}</span>
                              {addr.isDefault && <span className="chip green" style={{ fontSize: "11px", padding: "2px 8px" }}>Mặc định</span>}
                            </div>
                            <div className="muted" style={{ margin: "8px 0 4px", fontSize: "13.5px", lineHeight: "1.45" }}>
                              {addr.detail}
                            </div>
                            <div className="small muted">
                              <i className="fa-solid fa-phone" style={{ marginRight: "6px" }}></i>
                              {addr.phone}
                            </div>
                          </div>

                          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <button
                              type="button"
                              className="btn soft"
                              style={{ minHeight: "32px", padding: "0 12px", fontSize: "12px" }}
                              onClick={() => openAddressModal(addr)}
                            >
                              <i className="fa-solid fa-pen"></i> Sửa
                            </button>
                            {!addr.isDefault && (
                              <>
                                <button
                                  type="button"
                                  className="btn"
                                  style={{ minHeight: "32px", padding: "0 12px", fontSize: "12px" }}
                                  onClick={() => setDefaultAddress(addr.id)}
                                >
                                  Đặt làm mặc định
                                </button>
                                <button
                                  type="button"
                                  className="btn danger"
                                  style={{ minHeight: "32px", padding: "0 10px", fontSize: "12px" }}
                                  onClick={() => deleteAddress(addr.id)}
                                  title="Xóa địa chỉ"
                                >
                                  <i className="fa-solid fa-trash-can"></i>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Password */}
            {activeTab === "password" && (
              <div>
                <div className="account-card-header">
                  <div>
                    <h2 className="account-card-title">Đổi mật khẩu bảo mật</h2>
                    <p className="account-card-desc">Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác</p>
                  </div>
                </div>

                <div className="account-card-body" style={{ maxWidth: "560px" }}>
                  <form onSubmit={handlePasswordSave}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                      <div className="field">
                        <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "8px" }}>
                          Mật khẩu hiện tại
                        </label>
                        <div style={{ position: "relative" }}>
                          <input
                            type={showPassword ? "text" : "password"}
                            className="inputbox"
                            placeholder="Nhập mật khẩu đang sử dụng"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                            required
                            style={{ width: "100%", paddingRight: "40px" }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: 0, color: "var(--muted)", cursor: "pointer" }}
                          >
                            <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                          </button>
                        </div>
                      </div>

                      <div className="field">
                        <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "8px" }}>
                          Mật khẩu mới
                        </label>
                        <input
                          type={showPassword ? "text" : "password"}
                          className="inputbox"
                          placeholder="Tối thiểu 8 ký tự, gồm cả chữ và số"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          required
                          minLength={8}
                        />
                      </div>

                      <div className="field">
                        <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "8px" }}>
                          Xác nhận lại mật khẩu mới
                        </label>
                        <input
                          type={showPassword ? "text" : "password"}
                          className="inputbox"
                          placeholder="Nhập lại chính xác mật khẩu mới"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          required
                        />
                      </div>

                      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "10px", padding: "14px 16px", fontSize: "12.5px", color: "var(--muted)" }}>
                        <div style={{ fontWeight: "700", color: "var(--ink)", marginBottom: "4px" }}>
                          <i className="fa-solid fa-shield-halved" style={{ color: "var(--blue)", marginRight: "6px" }}></i>
                          Mẹo bảo vệ tài khoản:
                        </div>
                        <ul style={{ margin: 0, paddingLeft: "18px", lineHeight: "1.6" }}>
                          <li>Sử dụng mật khẩu dài ít nhất 8 ký tự</li>
                          <li>Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt (!@#$)</li>
                          <li>Tránh sử dụng thông tin cá nhân dễ đoán như ngày sinh hay số điện thoại</li>
                        </ul>
                      </div>

                      <div style={{ marginTop: "12px" }}>
                        <button
                          type="submit"
                          className="btn primary"
                          style={{ minHeight: "44px", padding: "0 28px" }}
                        >
                          <i className="fa-solid fa-shield-halved"></i> Cập nhật mật khẩu an toàn
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <div className="modal-overlay" onClick={() => setShowAddressModal(false)}>
          <div className="modal-card" style={{ maxWidth: "560px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <h3>{editingAddressId ? "Chỉnh sửa địa chỉ nhận hàng" : "Thêm địa chỉ nhận hàng mới"}</h3>
                <span className="small muted">Vui lòng điền đầy đủ và chính xác thông tin nhận hàng</span>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowAddressModal(false)}
                title="Đóng"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleAddressSubmit}>
              <div className="modal-body">
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div className="field">
                      <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>
                        Họ và tên người nhận
                      </label>
                      <input
                        className="inputbox"
                        value={addressForm.name}
                        onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                        required
                        placeholder="Nguyễn Văn A"
                      />
                    </div>
                    <div className="field">
                      <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>
                        Số điện thoại
                      </label>
                      <input
                        className="inputbox"
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                        required
                        placeholder="09xx xxx xxx"
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div className="field">
                      <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>
                        Tỉnh / Thành phố
                      </label>
                      <select
                        className="inputbox"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      >
                        <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                        <option value="Hà Nội">Hà Nội</option>
                        <option value="Đà Nẵng">Đà Nẵng</option>
                        <option value="Hải Phòng">Hải Phòng</option>
                        <option value="Cần Thơ">Cần Thơ</option>
                      </select>
                    </div>
                    <div className="field">
                      <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>
                        Loại địa chỉ
                      </label>
                      <select
                        className="inputbox"
                        value={addressForm.type}
                        onChange={(e) => setAddressForm({ ...addressForm, type: e.target.value })}
                      >
                        <option value="Nhà riêng">Nhà riêng</option>
                        <option value="Văn phòng">Văn phòng</option>
                      </select>
                    </div>
                  </div>

                  <div className="field">
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>
                      Địa chỉ cụ thể (Số nhà, tên đường, phường/xã, quận/huyện)
                    </label>
                    <input
                      className="inputbox"
                      value={addressForm.detail}
                      onChange={(e) => setAddressForm({ ...addressForm, detail: e.target.value })}
                      required
                      placeholder="Ví dụ: 12 Nguyễn Huệ, Phường Bến Nghé, Quận 1"
                    />
                  </div>

                  <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", marginTop: "4px" }}>
                    <input
                      type="checkbox"
                      checked={addressForm.isDefault}
                      onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                    />
                    <span style={{ fontSize: "13.5px" }}>Đặt làm địa chỉ nhận hàng mặc định</span>
                  </label>
                </div>
              </div>

              <div style={{ padding: "16px 24px", borderTop: "1px solid var(--line)", display: "flex", justifyContent: "flex-end", gap: "12px", background: "var(--surface)" }}>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowAddressModal(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="btn primary">
                  <i className="fa-solid fa-check"></i> Lưu địa chỉ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
