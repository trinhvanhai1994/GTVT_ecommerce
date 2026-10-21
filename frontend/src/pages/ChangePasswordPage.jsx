import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { ErrorBanner } from "../components/Feedback";
import { useAuth } from "../context/AuthContext";

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirm) {
      setError({ message: "Mật khẩu xác nhận không khớp" });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.post("/auth/change-password", { newPassword });
      await refreshProfile();
      navigate("/seller", { replace: true });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="form-card narrow">
      <p className="eyebrow">Bảo mật</p>
      <h1>Đổi mật khẩu bắt buộc</h1>
      <p className="muted">Tài khoản {user?.email} cần đặt mật khẩu mới trước khi vào Kênh người bán.</p>
      <ErrorBanner error={error} />
      <form onSubmit={submit}>
        <label>
          Mật khẩu mới
          <input type="password" minLength={8} required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        </label>
        <label>
          Xác nhận
          <input type="password" minLength={8} required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </label>
        <button className="btn btn-lg" disabled={loading}>
          {loading ? "Đang lưu…" : "Cập nhật mật khẩu"}
        </button>
      </form>
    </section>
  );
}
