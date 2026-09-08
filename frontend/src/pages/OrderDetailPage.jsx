import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import api from "../services/api";
import { ErrorBanner, Loading } from "../components/Feedback";
import { money, STATUS_LABEL } from "../utils/catalog";

export default function OrderDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.result || null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(!order);

  const load = () => {
    setLoading(true);
    api
      .get(`/orders/${id}`)
      .then((res) => setOrder(res.data.data))
      .catch(setError)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!location.state?.result) {
      void load();
    }
  }, [id]);

  const cancel = async () => {
    try {
      const { data } = await api.post(`/orders/${id}/cancel`);
      setOrder(data.data);
    } catch (err) {
      setError(err);
    }
  };

  if (loading) return <Loading />;
  if (!order) return <ErrorBanner error={error} />;

  const ok = order.status === "CONFIRMED" || order.status === "DELIVERED";
  const failed = order.status === "PAYMENT_FAILED";

  return (
    <section className="form-card">
      <Link className="crumb" to="/orders">
        ← Đơn hàng
      </Link>
      <h1>Đơn #{order.id}</h1>
      {ok && <div className="banner ok">Đặt hàng thành công. Chúng tôi sẽ chuẩn bị hàng.</div>}
      {failed && <div className="banner error">Thanh toán không thành công. Tồn kho đã được hoàn.</div>}
      <ErrorBanner error={error} />
      <p>
        Trạng thái: <strong className={`status ${order.status}`}>{STATUS_LABEL[order.status] || order.status}</strong>
      </p>
      {order.payment && (
        <p className="muted">
          Thanh toán: {order.payment.status} {order.payment.id ? `(#${order.payment.id})` : ""}
        </p>
      )}
      <p>
        Giao tới {order.shippingName} · {order.shippingPhone}
        <br />
        {order.shippingAddress}
      </p>
      <ul className="plain-list">
        {order.items?.map((i) => (
          <li key={i.productId}>
            {i.productName} × {i.quantity} — {money(i.subtotal)}
          </li>
        ))}
      </ul>
      <p className="price xl">Tổng {money(order.totalAmount)}</p>
      {["PENDING", "PAYMENT_PENDING", "CONFIRMED"].includes(order.status) && (
        <button className="btn btn-ghost" onClick={cancel}>
          Hủy đơn
        </button>
      )}
    </section>
  );
}
