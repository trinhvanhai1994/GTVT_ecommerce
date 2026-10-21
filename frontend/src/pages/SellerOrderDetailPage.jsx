import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import OrderTimeline from "../components/OrderTimeline";
import StatusChip from "../components/seller/StatusChip.jsx";
import api from "../services/api";
import { ErrorBanner, Loading } from "../components/Feedback";
import { money, STATUS_LABEL, labelOf } from "../utils/catalog";
import { useSellerShop } from "./seller/sellerContext.js";

const NEXT = { CONFIRMED: "PROCESSING", PROCESSING: "SHIPPING", SHIPPING: "DELIVERED" };
const NEXT_LABEL = { PROCESSING: "Bắt đầu xử lý", SHIPPING: "Chuyển giao hàng", DELIVERED: "Đã giao xong" };

export default function SellerOrderDetailPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { shop } = useSellerShop();
  const shopId = params.get("shopId") || String(shop?.id || "");
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get(`/orders/seller/${id}`, { params: { shopId } })
      .then((r) => setOrder(r.data.data))
      .catch(setError)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (shopId) load();
  }, [id, shopId]);

  const advance = async () => {
    const next = NEXT[order?.status];
    if (!next) return;
    try {
      const { data } = await api.patch(`/orders/seller/${id}/status`, { status: next }, { params: { shopId } });
      setOrder(data.data);
    } catch (e) {
      setError(e);
    }
  };

  if (!shopId) return <ErrorBanner error={{ message: "Thiếu shopId" }} />;
  if (loading) return <Loading />;
  if (!order) return <ErrorBanner error={error} />;

  const next = NEXT[order.status];

  return (
    <section className="seller-order-detail">
      <Link className="crumb" to="/seller/orders">
        ← Đơn bán
      </Link>
      <div className="page-title">
        <p className="eyebrow">
          Đơn bán #{order.id} · <StatusChip status={order.status} labels={STATUS_LABEL} />
        </p>
        <h1>{labelOf(STATUS_LABEL, order.status)}</h1>
      </div>
      <ErrorBanner error={error} />

      <div className="split">
        <div className="form-card">
          <h2>Tiến trình giao hàng</h2>
          <OrderTimeline status={order.status} />
          {next && (
            <button type="button" className="btn" onClick={advance}>
              {NEXT_LABEL[next]}
            </button>
          )}
          {order.payment && (
            <p className="muted">
              Thanh toán: {order.payment.status} {order.payment.id ? `(#${order.payment.id})` : ""}
            </p>
          )}
          <p className="muted">Phương thức: {order.paymentMethod || "—"}</p>
        </div>

        <aside className="summary-card">
          <h2>Giao hàng</h2>
          <p>
            {order.shippingName} · {order.shippingPhone}
            <br />
            {order.shippingAddress}
          </p>
          <p className="muted">
            Email khách: <strong>{order.customerEmail || "—"}</strong>
          </p>
          <hr className="soft-rule" />
          <h2>Sản phẩm</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Tên</th>
                <th className="num">SL</th>
                <th className="num">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((i) => (
                <tr key={i.productId}>
                  <td>{i.productName}</td>
                  <td className="num">{i.quantity}</td>
                  <td className="num">{money(i.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="price xl">Tổng {money(order.totalAmount)}</p>
        </aside>
      </div>
    </section>
  );
}
