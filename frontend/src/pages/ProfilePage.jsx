import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NOTIF_OPTS = [
  { key: "orderEmail", title: "Cập nhật trạng thái đơn hàng qua Email", badge: "Quan trọng", desc: "Tự động gửi email khi đơn hàng được xác nhận và giao thành công.", icon: "fa-envelope-open-text" },
  { key: "sms2h", title: "Thông báo SMS giao hàng hỏa tốc 2H", badge: "Hỏa tốc", desc: "Nhận tin nhắn SMS và link theo dõi trực tiếp vị trí tài xế.", icon: "fa-bolt" },
  { key: "promo", title: "Bản tin khuyến mãi & Voucher công nghệ", badge: "Ưu đãi", desc: "Nhận thông báo sớm các đợt Flash Sale và mã giảm giá độc quyền.", icon: "fa-tag" },
  { key: "security", title: "Cảnh báo bảo mật tài khoản", badge: "Bảo mật", desc: "Cảnh báo khi phát hiện lượt đăng nhập từ thiết bị lạ hoặc đổi mật khẩu.", icon: "fa-shield-halved" }
];

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("profile");
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    fullName: user?.fullName || "Demo Customer",
    email: user?.email || "customer@example.com",
    phone: "0901 234 567",
    dob: "2000-01-15",
    gender: "male"
  });

  const [addresses, setAddresses] = useState([
    { id: 1, name: "Demo Customer", phone: "0901 234 567", type: "Nhà riêng", detail: "12 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh", isDefault: true },
    { id: 2, name: "Demo Customer", phone: "0901 234 567", type: "Văn phòng", detail: "Landmark 81, 720A Điện Biên Phủ, Quận Bình Thạnh, TP. Hồ Chí Minh", isDefault: false }
  ]);

  const [notifs, setNotifs] = useState({ orderEmail: true, sms2h: true, promo: true, security: true });
  const [modalOpen, setModalOpen] = useState(false);
  const [editAddrId, setEditAddrId] = useState(null);
  const [addrForm, setAddrForm] = useState({ name: "", phone: "", type: "Nhà riêng", city: "TP. Hồ Chí Minh", detail: "", isDefault: false });

  const [pwdForm, setPwdForm] = useState({ current: "", next: "", confirm: "" });
  const [showPwd, setShowPwd] = useState(false);

  const notify = (text) => { setMsg(text); setTimeout(() => setMsg(""), 3000); };

  const handleAddrSubmit = (e) => {
    e.preventDefault();
    if (editAddrId) {
      setAddresses((prev) => prev.map((a) => a.id === editAddrId ? { ...a, ...addrForm, isDefault: addrForm.isDefault ? true : a.isDefault } : addrForm.isDefault ? { ...a, isDefault: false } : a));
      notify("Đã cập nhật địa chỉ nhận hàng!");
    } else {
      const item = { id: Date.now(), ...addrForm };
      setAddresses((prev) => addrForm.isDefault ? [...prev.map((a) => ({ ...a, isDefault: false })), item] : [...prev, item]);
      notify("Đã thêm địa chỉ nhận hàng mới!");
    }
    setModalOpen(false);
  };

  const openAddrModal = (addr = null) => {
    setEditAddrId(addr?.id || null);
    setAddrForm(addr ? { ...addr } : { name: form.fullName, phone: form.phone, type: "Nhà riêng", city: "TP. Hồ Chí Minh", detail: "", isDefault: !addresses.length });
    setModalOpen(true);
  };

  const initials = (form.fullName || "DC").split(" ").slice(-2).map((w) => w[0]).join("").toUpperCase();

  return (
    <div className="page">
      <div className="account-page-wrap">
        <div className="account-header-hero">
          <h1 className="h1">Tài khoản của tôi</h1>
          <p className="muted" style={{ margin: 0 }}>Quản lý hồ sơ cá nhân, sổ địa chỉ và bảo mật tài khoản.</p>
        </div>

        {msg && <div className="banner ok"><i className="fa-solid fa-circle-check"></i> {msg}</div>}

        <div className="account-layout">
          <aside className="account-side">
            <div className="account-user-summary">
              <div className="account-user-avatar">{initials}</div>
              <h3 className="account-user-name">{form.fullName}</h3>
              <p className="account-user-email">{form.email}</p>
              <span className="chip green" style={{ fontSize: 11 }}><i className="fa-solid fa-shield-check"></i> Thành viên Nexora</span>
            </div>

            <nav className="account-nav-list">
              {[
                { id: "profile", icon: "fa-user", label: "Hồ sơ cá nhân" },
                { id: "address", icon: "fa-location-dot", label: "Sổ địa chỉ" },
                { id: "password", icon: "fa-key", label: "Đổi mật khẩu" },
                { id: "notifications", icon: "fa-bell", label: "Cài đặt thông báo" }
              ].map((item) => (
                <div key={item.id} className={`account-nav ${tab === item.id ? "active" : ""}`} onClick={() => setTab(item.id)}>
                  <i className={`fa-solid ${item.icon}`}></i> <span>{item.label}</span>
                </div>
              ))}
              <div className="account-nav-divider"></div>
              <div className="account-nav" onClick={() => navigate("/orders")}>
                <i className="fa-solid fa-box"></i> <span>Lịch sử đơn hàng</span>
              </div>
              <div className="account-nav account-nav-danger" onClick={() => { logout(); navigate("/login"); }}>
                <i className="fa-solid fa-arrow-right-from-bracket"></i> <span>Đăng xuất</span>
              </div>
            </nav>
          </aside>

          <div className="account-main-card">
            {tab === "profile" && (
              <div>
                <div className="account-card-header">
                  <h2 className="account-card-title">Hồ sơ cá nhân</h2>
                </div>
                <div className="account-card-body">
                  <form onSubmit={(e) => { e.preventDefault(); notify("Đã cập nhật thông tin hồ sơ!"); }}>
                    <div className="form-grid">
                      <div className="field">
                        <label>Họ và tên</label>
                        <input className="inputbox" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
                      </div>
                      <div className="field">
                        <label>Email</label>
                        <input type="email" className="inputbox" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                      </div>
                      <div className="field">
                        <label>Số điện thoại</label>
                        <input className="inputbox" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
                      </div>
                      <div className="field">
                        <label>Ngày sinh</label>
                        <input type="date" className="inputbox" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
                      </div>
                      <div className="field" style={{ gridColumn: "1 / -1" }}>
                        <label>Giới tính</label>
                        <div style={{ display: "flex", gap: 24 }}>
                          {["male:Nam", "female:Nữ", "other:Khác"].map((g) => {
                            const [val, lbl] = g.split(":");
                            return (
                              <label key={val} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                                <input type="radio" name="gender" checked={form.gender === val} onChange={() => setForm({ ...form, gender: val })} /> {lbl}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <div style={{ marginTop: 28, display: "flex", justifyContent: "flex-end" }}>
                      <button type="submit" className="btn primary"><i className="fa-solid fa-check"></i> Lưu thay đổi</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {tab === "address" && (
              <div>
                <div className="account-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h2 className="account-card-title">Sổ địa chỉ nhận hàng</h2>
                  <button type="button" className="btn primary" style={{ fontSize: 13 }} onClick={() => openAddrModal()}>
                    <i className="fa-solid fa-plus"></i> Thêm địa chỉ mới
                  </button>
                </div>
                <div className="account-card-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {addresses.map((a) => (
                    <div key={a.id} className="card address" style={{ margin: 0, padding: 20, borderLeft: a.isDefault ? "4px solid var(--blue)" : "1px solid var(--line)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <strong>{a.name}</strong> <span className="chip" style={{ fontSize: 11 }}>{a.type}</span>
                            {a.isDefault && <span className="chip green" style={{ fontSize: 11 }}>Mặc định</span>}
                          </div>
                          <div className="muted" style={{ margin: "6px 0 4px", fontSize: 13.5 }}>{a.detail}</div>
                          <div className="small muted"><i className="fa-solid fa-phone" style={{ marginRight: 6 }}></i>{a.phone}</div>
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <button type="button" className="btn soft" style={{ minHeight: 32, padding: "0 10px", fontSize: 12 }} onClick={() => openAddrModal(a)}>Sửa</button>
                          {!a.isDefault && (
                            <>
                              <button type="button" className="btn" style={{ minHeight: 32, padding: "0 10px", fontSize: 12 }} onClick={() => { setAddresses((prev) => prev.map((x) => ({ ...x, isDefault: x.id === a.id }))); notify("Đã đổi địa chỉ mặc định!"); }}>Đặt mặc định</button>
                              <button type="button" className="btn danger" style={{ minHeight: 32, padding: "0 8px", fontSize: 12 }} onClick={() => { setAddresses((p) => p.filter((x) => x.id !== a.id)); notify("Đã xóa địa chỉ!"); }}><i className="fa-solid fa-trash-can"></i></button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "password" && (
              <div>
                <div className="account-card-header">
                  <h2 className="account-card-title">Đổi mật khẩu bảo mật</h2>
                </div>
                <div className="account-card-body" style={{ maxWidth: 520 }}>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (pwdForm.next !== pwdForm.confirm) return alert("Mật khẩu xác nhận không khớp!");
                    setPwdForm({ current: "", next: "", confirm: "" });
                    notify("Đã đổi mật khẩu tài khoản thành công!");
                  }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div className="field">
                      <label>Mật khẩu hiện tại</label>
                      <input type={showPwd ? "text" : "password"} className="inputbox" value={pwdForm.current} onChange={(e) => setPwdForm({ ...pwdForm, current: e.target.value })} required />
                    </div>
                    <div className="field">
                      <label>Mật khẩu mới</label>
                      <input type={showPwd ? "text" : "password"} className="inputbox" minLength={8} value={pwdForm.next} onChange={(e) => setPwdForm({ ...pwdForm, next: e.target.value })} required />
                    </div>
                    <div className="field">
                      <label>Xác nhận mật khẩu mới</label>
                      <input type={showPwd ? "text" : "password"} className="inputbox" value={pwdForm.confirm} onChange={(e) => setPwdForm({ ...pwdForm, confirm: e.target.value })} required />
                    </div>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13 }}>
                      <input type="checkbox" checked={showPwd} onChange={(e) => setShowPwd(e.target.checked)} /> Hiển thị mật khẩu
                    </label>
                    <button type="submit" className="btn primary" style={{ alignSelf: "flex-start", marginTop: 8 }}><i className="fa-solid fa-shield-halved"></i> Cập nhật mật khẩu</button>
                  </form>
                </div>
              </div>
            )}

            {tab === "notifications" && (
              <div>
                <div className="account-card-header">
                  <h2 className="account-card-title">Cài đặt nhận tin & Thông báo</h2>
                </div>
                <div className="account-card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {NOTIF_OPTS.map((opt) => (
                    <div key={opt.key} className="notif-option-card" onClick={() => setNotifs((n) => ({ ...n, [opt.key]: !n[opt.key] }))}>
                      <div className="notif-icon-box"><i className={`fa-solid ${opt.icon}`}></i></div>
                      <div className="notif-content">
                        <div className="notif-title"><span>{opt.title}</span><span className="notif-badge">{opt.badge}</span></div>
                        <p className="notif-desc">{opt.desc}</p>
                      </div>
                      <div className={`notif-switch ${notifs[opt.key] ? "active" : ""}`}><div className="notif-switch-knob"></div></div>
                    </div>
                  ))}
                  <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
                    <button type="button" className="btn primary" onClick={() => notify("Đã lưu cài đặt thông báo!")}><i className="fa-solid fa-check"></i> Lưu cài đặt</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-card" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editAddrId ? "Sửa địa chỉ nhận hàng" : "Thêm địa chỉ mới"}</h3>
              <button type="button" className="modal-close" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleAddrSubmit} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <input className="inputbox" placeholder="Họ tên người nhận" value={addrForm.name} onChange={(e) => setAddrForm({ ...addrForm, name: e.target.value })} required />
                <input className="inputbox" placeholder="Số điện thoại" value={addrForm.phone} onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })} required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <select className="inputbox" value={addrForm.city} onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })}>
                  {["TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Hải Phòng", "Cần Thơ"].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <select className="inputbox" value={addrForm.type} onChange={(e) => setAddrForm({ ...addrForm, type: e.target.value })}>
                  <option value="Nhà riêng">Nhà riêng</option><option value="Văn phòng">Văn phòng</option>
                </select>
              </div>
              <input className="inputbox" placeholder="Số nhà, tên đường, phường/xã" value={addrForm.detail} onChange={(e) => setAddrForm({ ...addrForm, detail: e.target.value })} required />
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                <input type="checkbox" checked={addrForm.isDefault} onChange={(e) => setAddrForm({ ...addrForm, isDefault: e.target.checked })} /> Đặt làm mặc định
              </label>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 12 }}>
                <button type="button" className="btn" onClick={() => setModalOpen(false)}>Hủy</button>
                <button type="submit" className="btn primary"><i className="fa-solid fa-check"></i> Lưu địa chỉ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
