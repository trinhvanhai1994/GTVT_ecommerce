import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { Empty, ErrorBanner, Loading } from "../components/Feedback";
import { money, STATUS_LABEL } from "../utils/catalog";

export default function OrderListPage() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void api
      .get("/orders")
      .then((res) => setOrders(res.data.data || []))
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  return (
    <section>
      <div className="page-title row-between">
        <div>
          <h1>Đơn hàng của tôi</h1>
          <p className="muted">Theo dõi trạng thái và email cập nhật từng bước.</p>
        </div>
        <Link className="btn btn-ghost btn-sm" to="/notifications">
          Thông báo
        </Link>
      </div>
      <ErrorBanner error={error} />
      {orders.length === 0 && (
        <Empty
          title="Chưa có đơn nào"
          text="Khi bạn đặt hàng, tiến trình và email xác nhận sẽ hiện ở đây."
          action={
            <Link className="btn" to="/products">
              Mua sắm
            </Link>
          }
        />
      )}
      <ul className="order-list">
        {orders.map((o) => (
          <li key={o.id}>
            <Link to={`/orders/${o.id}`} className="order-row">
              <div>
                <strong>Đơn #{o.id}</strong>
                <p className="muted">{o.shippingAddress}</p>
                {o.customerEmail && <p className="muted tiny">Mail: {o.customerEmail}</p>}
              </div>
              <span className={`status ${o.status}`}>{STATUS_LABEL[o.status] || o.status}</span>
              <span className="price">{money(o.totalAmount)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
