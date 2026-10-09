import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ErrorBanner } from "../components/Feedback";
import { MessageConstant, NumberConstant } from "../constants";
import api from "../services/api";

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = useMemo(() => (params.get("token") || "").trim(), [params]);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!token) {
      setError({ message: MessageConstant.RESET_TOKEN_MISSING });
      return;
    }
    if (password.length < NumberConstant.PASSWORD_MIN_LENGTH) {
      setError({ message: MessageConstant.PASSWORD_MIN_LENGTH });
      return;
    }
    if (password !== confirm) {
      setError({ message: MessageConstant.PASSWORD_MISMATCH });
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, newPassword: password });
      navigate("/login", { replace: true, state: { resetOk: true } });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-layout">
      <div className="auth-copy">
        <p className="eyebrow">Đặt lại</p>
        <h1>Chọn mật khẩu mới.</h1>
        <p className="lede">Liên kết chỉ dùng một lần và hết hạn sau 30 phút.</p>
      </div>
      <form className="form-card" onSubmit={onSubmit}>
        <h2>Mật khẩu mới</h2>
        <ErrorBanner error={error} />
        {!token && (
          <div className="banner">
            <strong>Không có token</strong>
            <span>
              Vào <Link to="/forgot-password">quên mật khẩu</Link> để nhận liên kết mới.
            </span>
          </div>
        )}
        <label>
          Mật khẩu mới
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={NumberConstant.PASSWORD_MIN_LENGTH}
            autoComplete="new-password"
            placeholder={`Tối thiểu ${NumberConstant.PASSWORD_MIN_LENGTH} ký tự`}
          />
        </label>
        <label>
          Xác nhận mật khẩu
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={NumberConstant.PASSWORD_MIN_LENGTH}
            autoComplete="new-password"
          />
        </label>
        <button className="btn btn-lg" disabled={loading || !token}>
          {loading ? "Đang lưu..." : "Cập nhật mật khẩu"}
        </button>
        <p className="auth-links">
          <Link to="/login">Đăng nhập</Link>
        </p>
      </form>
    </section>
  );
}
