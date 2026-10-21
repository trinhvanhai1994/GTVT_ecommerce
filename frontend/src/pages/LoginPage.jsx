import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { homeForAuthenticatedUser } from "../utils/authRedirect.js";
import { ErrorBanner } from "../components/Feedback";
import api from "../services/api";
import { clearPendingCart, readPendingCart } from "../utils/pendingCart";

export default function LoginPage() {
  const { login, isAuthenticated, isPlatformAdmin, isSeller, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    const dest = homeForAuthenticatedUser({
      isPlatformAdmin,
      isSeller,
      mustChangePassword: user?.mustChangePassword
    });
    return <Navigate to={dest} replace />;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login(email, password);
      const role = String(user.role || "").toUpperCase();
      if (role === "ADMIN" || role === "PLATFORM_ADMIN") {
        setError({ message: "Tài khoản quản trị sàn — vui lòng đăng nhập tại cổng Admin." });
        return;
      }
      if (role === "SELLER") {
        clearPendingCart();
        if (user.mustChangePassword) {
          navigate("/change-password", { replace: true });
          return;
        }
        const from = location.state?.from || "";
        if (from.startsWith("/register-shop")) {
          navigate("/register-shop", { replace: true });
          return;
        }
        navigate(from.startsWith("/seller") ? from : "/seller", { replace: true });
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
        <h2>Đăng nhập khách hàng</h2>
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
        <p className="auth-links muted">
          Người bán: <Link to="/seller/login">/seller/login</Link> · Quản trị: <Link to="/admin/login">/admin/login</Link>
        </p>
        {error?.message?.includes("quản trị") && (
          <p className="auth-links">
            <Link to="/admin/login">→ Cổng quản trị sàn</Link>
          </p>
        )}
      </form>
    </section>
  );
}
