import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { homeForAuthenticatedUser } from "../utils/authRedirect.js";
import { ErrorBanner } from "../components/Feedback";
export default function SellerLoginPage() {
  const { login, isAuthenticated, isPlatformAdmin, isSeller, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
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
        setError({ message: "Tài khoản quản trị sàn — dùng /admin/login." });
        return;
      }
      if (role !== "SELLER") {
        setError({
          message: "Chưa phải tài khoản người bán. Đăng ký gian hàng sau khi đăng nhập khách, hoặc chờ duyệt shop."
        });
        return;
      }
      if (user.mustChangePassword) {
        navigate("/change-password", { replace: true });
        return;
      }
      navigate(location.state?.from?.startsWith("/seller") ? location.state.from : "/seller", { replace: true });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-layout auth-merchant">
      <div className="auth-copy">
        <p className="eyebrow">Kênh người bán</p>
        <h1>Đăng nhập quản lý gian hàng</h1>
        <p className="muted">Sau khi shop được duyệt, dùng email shop để vào dashboard.</p>
        <div className="auth-merchant-preview" aria-hidden="true">
          <strong>Seller Center gồm:</strong>
          <ul>
            <li>Tổng quan doanh thu & đơn 7 ngày</li>
            <li>Xử lý đơn, catalog, tồn kho</li>
            <li>Cài đặt gian hàng & link vitrine</li>
          </ul>
        </div>
      </div>
      <form className="form-card" onSubmit={onSubmit}>
        <h2>Người bán</h2>
        <ErrorBanner error={error} />
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
        <button className="btn btn-lg" disabled={loading}>
          {loading ? "Đang đăng nhập…" : "Vào Kênh người bán"}
        </button>
        <p className="auth-links">
          Chưa có gian hàng?{" "}
          <Link to="/login" state={{ from: "/register-shop" }}>
            Đăng nhập khách
          </Link>{" "}
          rồi <Link to="/register-shop">mở hồ sơ shop</Link>
        </p>
        <p className="auth-links">
          <Link to="/">← Về trang chủ</Link>
        </p>
      </form>
    </section>
  );
}
