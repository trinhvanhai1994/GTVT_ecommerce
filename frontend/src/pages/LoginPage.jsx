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
  const [email, setEmail] = useState(location.state?.email || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login(email, password);
      const role = String(user.role || "").toUpperCase();
      if (role === "ADMIN" || role === "PLATFORM_ADMIN") {
        clearPendingCart();
        navigate(location.state?.from?.startsWith("/admin") ? location.state.from : "/admin", { replace: true });
        return;
      }
      if (role === "SELLER" && (location.state?.from || "").startsWith("/seller")) {
        navigate("/seller", { replace: true });
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
    <section className="auth-layout">
      <div className="auth-copy">
        <p className="eyebrow">Xin chào</p>
        <h1>{location.state?.intent === "cart" ? "Đăng nhập để thêm vào giỏ." : "Đăng nhập để mua và theo dõi đơn."}</h1>
        {location.state?.productName && <p className="lede">Sản phẩm: {location.state.productName}</p>}
        <p className="muted">Quên mật khẩu? Dùng liên kết bên dưới để nhận email đặt lại.</p>
      </div>
      <form className="form-card" onSubmit={onSubmit}>
        <h2>Đăng nhập</h2>
        <ErrorBanner error={error} />
        {location.state?.registeredOk && (
          <div className="banner ok">
            <strong>Tài khoản đã tạo</strong>
            <span>Đăng nhập để bắt đầu mua sắm trên Nava.</span>
          </div>
        )}
        {location.state?.resetOk && (
          <div className="banner ok">
            <strong>Đã đổi mật khẩu</strong>
            <span>Đăng nhập bằng mật khẩu mới.</span>
          </div>
        )}
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" autoComplete="email" />
        </label>
        <label>
          Mật khẩu
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            type="password"
            autoComplete="current-password"
          />
        </label>
        <div className="auth-row">
          <Link to="/forgot-password" state={{ email }}>
            Quên mật khẩu?
          </Link>
        </div>
        <button className="btn btn-lg" disabled={loading}>
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
        <p className="auth-links">
          Chưa có tài khoản? <Link to="/register" state={location.state}>Tạo tài khoản miễn phí</Link>
        </p>
      </form>
    </section>
  );
}
