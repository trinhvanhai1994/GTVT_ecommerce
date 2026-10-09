import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import api from "../services/api";
import { ErrorBanner, Loading } from "../components/Feedback";
import OrderTimeline from "../components/OrderTimeline";
import { money, STATUS_LABEL } from "../utils/catalog";
import { useAuth } from "../context/AuthContext";
import { useDialog } from "../context/DialogContext";

export default function OrderDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const { confirm, toast } = useDialog();
  const [order, setOrder] = useState(location.state?.result || null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(!order);
  const [cancelling, setCancelling] = useState(false);
  const justPlaced = Boolean(location.state?.justPlaced);

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
    const ok = await confirm({
      title: "Huỷ đơn hàng?",
      message: "Chúng tôi sẽ gửi email xác nhận huỷ tới địa chỉ trên đơn.",
      confirmLabel: "Huỷ đơn",
      cancelLabel: "Giữ đơn",
      danger: true
    });
    if (!ok) return;
    setCancelling(true);
    setError(null);
    try {
      const { data } = await api.post(`/orders/${id}/cancel`);
      setOrder(data.data);
      toast({ title: "Đã huỷ đơn", message: `Đơn #${id} đã được huỷ.`, variant: "ok" });
    } catch (err) {
      setError(err);
      toast({ title: "Không huỷ được", message: err.message || "Thử lại sau.", variant: "error" });
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <Loading />;
  if (!order) return <ErrorBanner error={error} />;

  const ok = order.status === "CONFIRMED" || order.status === "DELIVERED" || order.status === "PROCESSING" || order.status === "SHIPPING";
  const failed = order.status === "PAYMENT_FAILED";
  const notifyEmail = order.customerEmail || user?.email;

  return (
    <section className="order-detail">
      <Link className="crumb" to="/orders">
        ← Đơn hàng
      </Link>
      <div className="page-title">
        <p className="eyebrow">Đơn #{order.id}</p>
        <h1>{STATUS_LABEL[order.status] || order.status}</h1>
      </div>

      {justPlaced && ok && (
        <div className="banner ok">
          <strong>Đặt hàng thành công</strong>
          <span>
            Email xác nhận đang gửi tới {notifyEmail || "email của bạn"}. Bạn cũng xem lại trong{" "}
            <Link to="/notifications">Thông báo</Link>.
          </span>
        </div>
      )}
      {failed && (
        <div className="banner error">
          <strong>Thanh toán không thành công</strong>
          <span>Tồn kho đã được hoàn. Bạn có thể đặt lại từ giỏ hàng.</span>
        </div>
      )}
      {order.status === "CANCELLED" && (
        <div className="banner error">
          <strong>Đơn đã hủy</strong>
          <span>Email xác nhận hủy đã được ghi nhận / gửi (nếu bật mail).</span>
        </div>
      )}

      <ErrorBanner error={error} />

      <div className="split">
        <div className="form-card">
          <h2>Tiến trình</h2>
          <OrderTimeline status={order.status} />
          <p className="muted">
            Mỗi lần trạng thái đổi, Nava gửi email tới <strong>{notifyEmail || "email tài khoản"}</strong>.
          </p>
          {order.payment && (
            <p className="muted">
              Thanh toán: {order.payment.status} {order.payment.id ? `(#${order.payment.id})` : ""}
            </p>
          )}
          {["PENDING", "PAYMENT_PENDING", "CONFIRMED"].includes(order.status) && (
            <button className="btn btn-ghost" onClick={cancel} disabled={cancelling}>
              {cancelling ? "Đang hủy..." : "Hủy đơn"}
            </button>
          )}
        </div>

        <aside className="summary-card">
          <h2>Giao hàng</h2>
          <p>
            {order.shippingName} · {order.shippingPhone}
            <br />
            {order.shippingAddress}
          </p>
          {notifyEmail && (
            <p className="muted">
              Email thông báo: <strong>{notifyEmail}</strong>
            </p>
          )}
          <hr className="soft-rule" />
          <h2>Sản phẩm</h2>
          <ul className="plain-list">
            {order.items?.map((i) => (
              <li key={i.productId}>
                {i.productName} × {i.quantity} — {money(i.subtotal)}
              </li>
            ))}
          </ul>
          <p className="price xl">Tổng {money(order.totalAmount)}</p>
          <Link className="btn btn-ghost" to="/notifications">
            Xem thông báo email
          </Link>
        </aside>
      </div>
    </section>
  );
}
