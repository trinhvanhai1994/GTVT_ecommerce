import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { ErrorBanner, Loading } from "../components/Feedback";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { money } from "../utils/catalog";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, refresh } = useCart();
  const [form, setForm] = useState({
    shippingName: user?.fullName || "",
    shippingPhone: "",
    shippingAddress: "",
    paymentMethod: "COD",
    simulatePaymentFailure: false
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void refresh().finally(() => setLoading(false));
  }, [refresh]);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const { data } = await api.post("/orders", form);
      await refresh();
      const orders = Array.isArray(data.data) ? data.data : [data.data];
      const first = orders[0];
      navigate(first ? `/orders/${first.id}` : "/orders", {
        state: { results: orders, result: first, justPlaced: true }
      });
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;
  const items = cart?.items || [];

  return (
    <section className="split">
      <form className="form-card" onSubmit={submit}>
        <div className="page-title">
          <p className="eyebrow">Bước cuối</p>
          <h1>Thanh toán</h1>
        </div>
        <ErrorBanner error={error} />
        <div className="info-pill">
          Xác nhận đơn &amp; cập nhật trạng thái sẽ gửi tới <strong>{user?.email || "email tài khoản"}</strong>
        </div>
        <label>
          Người nhận
          <input value={form.shippingName} onChange={(e) => setForm({ ...form, shippingName: e.target.value })} required />
        </label>
        <label>
          Số điện thoại
          <input value={form.shippingPhone} onChange={(e) => setForm({ ...form, shippingPhone: e.target.value })} required />
        </label>
        <label>
          Địa chỉ giao hàng
          <input value={form.shippingAddress} onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })} required />
        </label>
        <label>
          Phương thức thanh toán
          <select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
            <option value="COD">Thanh toán khi nhận hàng</option>
            <option value="MOCK_CARD">Thẻ</option>
            <option value="MOCK_BANKING">Chuyển khoản</option>
          </select>
        </label>
        <button className="btn btn-lg" disabled={submitting || !items.length}>
          {submitting ? "Đang đặt hàng..." : "Đặt hàng"}
        </button>
      </form>
      <aside className="summary-card">
        <h2>Đơn của bạn</h2>
        <p className="muted">{items.length} mặt hàng trong giỏ</p>
        <p className="summary-row">
          <span>Số lượng sản phẩm</span>
          <strong>{items.reduce((s, i) => s + i.quantity, 0)}</strong>
        </p>
        <p className="muted">Giá được chốt tại thời điểm đặt hàng.</p>
        <hr className="soft-rule" />
        <p className="muted">
          Sau khi đặt hàng thành công, bạn sẽ nhận email xác nhận và có thể theo dõi tiến trình trong mục Đơn hàng.
        </p>
      </aside>
    </section>
  );
}
