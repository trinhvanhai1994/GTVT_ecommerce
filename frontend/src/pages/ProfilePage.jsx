import { useEffect, useState } from "react";
import api from "../services/api";
import { ErrorBanner, Loading } from "../components/Feedback";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(user);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void api
      .get("/auth/profile")
      .then((res) => setProfile(res.data.data))
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  return (
    <section className="form-card narrow">
      <p className="eyebrow">Tài khoản</p>
      <h1>Hồ sơ của bạn</h1>
      <ErrorBanner error={error} />
      {profile && (
        <dl className="dl">
          <dt>Họ tên</dt>
          <dd>{profile.fullName}</dd>
          <dt>Email</dt>
          <dd>{profile.email}</dd>
          <dt>Vai trò</dt>
          <dd>{profile.role === "ADMIN" ? "Quản trị" : "Khách hàng"}</dd>
          <dt>Trạng thái</dt>
          <dd>{profile.status}</dd>
        </dl>
      )}
    </section>
  );
}
