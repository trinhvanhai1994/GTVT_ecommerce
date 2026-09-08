import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ErrorBanner } from "../components/Feedback";
import api from "../services/api";
import { clearPendingCart, readPendingCart } from "../utils/pendingCart";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fromAdmin = location.state?.from?.startsWith("/admin");

  const [email, setEmail] = useState(fromAdmin ? "admin@example.com" : "customer@example.com");
  const [password, setPassword] = useState("Password123");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login(email, password);
      const role = String(user.role || "").toUpperCase();
      if (role === "ADMIN") {
        clearPendingCart();
        navigate(location.state?.from?.startsWith("/admin") ? location.state.from : "/admin", { replace: true });
        return;
      }
      const pending = readPendingCart();
      if (pending?.productId) {
        try {
          await api.post("/cart/items", pending);
          clearPendingCart();
          navigate("/cart", { replace: true });
          return;
        } catch {
          clearPendingCart();
        }
      }
      const dest = location.state?.from || "/";
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      {/* Left Dark Hero */}
      <div className="auth-hero">
        <div className="brand" style={{ color: "#a6c7ff", fontSize: "24px" }}>
          NEXORA TECH
        </div>
        <h1>Đăng nhập để tiếp tục hành trình mua sắm công nghệ.</h1>
        <p style={{ color: "#c2cfe0", fontSize: "16px", lineHeight: "1.6" }}>
          Theo dõi đơn hàng thời gian thực, lưu địa chỉ giao hàng hỏa tốc, nhận ưu đãi độc quyền và đánh giá sản phẩm.
        </p>

        <div style={{ marginTop: "40px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <span className="small" style={{ color: "#94a3b8" }}>Tài khoản demo sẵn có:</span>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              className="btn"
              style={{ background: "rgba(255,255,255,0.08)", color: "#fff", borderColor: "rgba(255,255,255,0.15)", fontSize: "12px", minHeight: "36px" }}
              onClick={() => {
                setEmail("customer@example.com");
                setPassword("Password123");
              }}
            >
              👤 Khách: customer@example.com
            </button>
            <button
              type="button"
              className="btn"
              style={{ background: "rgba(255,255,255,0.08)", color: "#fff", borderColor: "rgba(255,255,255,0.15)", fontSize: "12px", minHeight: "36px" }}
              onClick={() => {
                setEmail("admin@example.com");
                setPassword("Password123");
              }}
            >
              ⚙️ Admin: admin@example.com
            </button>
          </div>
        </div>
      </div>

      {/* Right Form Area */}
      <div className="auth-formarea">
        <div className="auth-form">
          <Link to="/" className="link small" style={{ marginBottom: "20px" }}>
            ← Về trang chủ NEXORA TECH
          </Link>

          <h1>Đăng nhập</h1>
          <div className="muted" style={{ marginBottom: "20px" }}>
            Sử dụng email và mật khẩu của bạn để đăng nhập vào tài khoản.
          </div>

          <ErrorBanner error={error} />

          <form onSubmit={onSubmit}>
            <div className="field">
              <label>Địa chỉ Email</label>
              <input
                className="inputbox"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
              />
            </div>

            <div className="field">
              <label>Mật khẩu</label>
              <input
                className="inputbox"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                type="password"
                autoComplete="current-password"
                placeholder="Nhập mật khẩu"
              />
            </div>

            <button
              type="submit"
              className="btn primary"
              style={{ width: "100%", marginTop: "24px", minHeight: "48px", fontSize: "15px" }}
              disabled={loading}
            >
              {loading ? "Đang xác thực..." : "Đăng nhập ngay"}
            </button>

            <div style={{ marginTop: "24px", textAlign: "center" }}>
              Chưa có tài khoản?{" "}
              <Link to="/register" state={location.state} className="link">
                Đăng ký tài khoản mới
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
