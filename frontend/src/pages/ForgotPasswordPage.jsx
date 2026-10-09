import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ErrorBanner } from "../components/Feedback";
import api from "../services/api";

export default function ForgotPasswordPage() {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-layout">
      <div className="auth-copy">
        <p className="eyebrow">Khôi phục</p>
        <h1>Đặt lại mật khẩu qua email.</h1>
        <p className="lede">
          Nhập email đã đăng ký. Nếu tài khoản tồn tại, hệ thống gửi liên kết đặt lại (có hiệu lực 30 phút).
        </p>
      </div>
      <form className="form-card" onSubmit={onSubmit}>
        <h2>Quên mật khẩu</h2>
        <ErrorBanner error={error} />
        {sent && (
          <div className="banner ok">
            <strong>Đã xử lý yêu cầu</strong>
            <span>
              Nếu email tồn tại, hãy kiểm tra hộp thư (hoặc log mock khi mail tắt). Sau đó mở liên kết để đặt mật khẩu mới.
            </span>
          </div>
        )}
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            disabled={sent}
          />
        </label>
        <button className="btn btn-lg" disabled={loading || sent}>
          {loading ? "Đang gửi..." : sent ? "Đã gửi" : "Gửi liên kết"}
        </button>
        <p className="auth-links">
          <Link to="/login" state={{ email }}>
            Quay lại đăng nhập
          </Link>
        </p>
      </form>
    </section>
  );
}
