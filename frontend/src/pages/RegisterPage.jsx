import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ErrorBanner } from "../components/Feedback";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (form.password !== form.confirmPassword) {
      setError({ message: "Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại." });
      return;
    }
    setLoading(true);
    try {
      await register({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password
      });
      navigate(location.state?.from || "/login", {
        state: { ...location.state, registeredEmail: form.email }
      });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      {/* Left Blue Hero */}
      <div className="auth-hero blue">
        <div className="brand" style={{ color: "#ffffff", fontSize: "24px" }}>
          NEXORA TECH
        </div>
        <h1 style={{ color: "#ffffff" }}>Tạo tài khoản mới</h1>
        <p style={{ color: "#e3edff", fontSize: "16px", lineHeight: "1.6" }}>
          Một tài khoản duy nhất để mua sắm, nhận ưu đãi độc quyền 1.000.000 ₫ và hưởng chính sách bảo hành VIP.
        </p>
      </div>

      {/* Right Form Area */}
      <div className="auth-formarea" style={{ padding: "48px 64px" }}>
        <div className="auth-form">
          <Link to="/" className="link small" style={{ marginBottom: "16px" }}>
            ← Về trang chủ NEXORA TECH
          </Link>

          <h1>Đăng ký tài khoản</h1>
          <div className="muted" style={{ marginBottom: "20px" }}>
            Điền đầy đủ thông tin để tham gia hệ sinh thái NEXORA.
          </div>

          <ErrorBanner error={error} />

          <form onSubmit={onSubmit}>
            <div className="field">
              <label>Họ và tên của bạn</label>
              <input
                className="inputbox"
                placeholder="Nguyễn Văn A"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                required
              />
            </div>

            <div className="field">
              <label>Địa chỉ Email</label>
              <input
                className="inputbox"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="field">
              <label>Số điện thoại liên lạc</label>
              <input
                className="inputbox"
                type="tel"
                placeholder="0901 234 567"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
            </div>

            <div className="field">
              <label>Mật khẩu (Tối thiểu 6 ký tự)</label>
              <input
                className="inputbox"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <div className="field">
              <label>Xác nhận lại mật khẩu</label>
              <input
                className="inputbox"
                type="password"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              className="btn primary"
              style={{ width: "100%", marginTop: "24px", minHeight: "48px", fontSize: "15px" }}
              disabled={loading}
            >
              {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản NEXORA"}
            </button>

            <div style={{ marginTop: "20px", textAlign: "center" }}>
              Đã có tài khoản?{" "}
              <Link to="/login" state={location.state} className="link">
                Đăng nhập ngay
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
