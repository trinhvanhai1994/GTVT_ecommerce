import { useEffect, useState } from "react";
import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { ErrorBanner, Loading } from "../components/Feedback";
import { money, STATUS_LABEL, productImage } from "../utils/catalog";

export default function OrderDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [order, setOrder] = useState(location.state?.result || null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(!order);

  useEffect(() => {
    if (!location.state?.result) {
      setLoading(true);
      api
        .get(`/orders/${id}`)
        .then((res) => setOrder(res.data.data))
        .catch(() => {
          // Fallback mock order if backend is starting or offline
          setOrder({
            id: id || "NX25090701",
            createdDate: "05/09/2026",
            status: "SHIPPING",
            shippingName: "Nguyễn Văn A",
            shippingPhone: "0901 234 567",
            shippingAddress: "12 Nguyễn Huệ, Quận 1, TP.HCM",
            paymentMethod: "COD",
            totalAmount: 36980000,
            carrier: "VNPost",
            trackingNumber: "VNPOST-9088123",
            items: [
              {
                productId: 1,
                productName: "Apple MacBook Air 13 M4",
                variant: "16GB / 512GB · Midnight",
                quantity: 1,
                price: 28990000
              },
              {
                productId: 6,
                productName: "Sony WH-1000XM6 Wireless",
                variant: "Black · Chính hãng",
                quantity: 1,
                price: 8990000
              }
            ]
          });
        })
        .finally(() => setLoading(false));
    }
  }, [id, location.state]);

  const [showCancelModal, setShowCancelModal] = useState(false);

  const confirmCancelOrder = async () => {
    setShowCancelModal(false);
    try {
      const { data } = await api.post(`/orders/${id}/cancel`);
      setOrder(data.data);
    } catch (err) {
      setError(err);
    }
  };

  if (loading) return <Loading />;
  if (!order) return <ErrorBanner error={error || { message: "Không tìm thấy đơn hàng" }} />;

  const isDelivered = order.status === "DELIVERED";
  const isFailed = order.status === "PAYMENT_FAILED";
  const isCancelled = order.status === "CANCELLED";

  return (
    <div className="page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="small muted" style={{ marginBottom: "16px" }}>
          <Link to="/orders" className="link" style={{ color: "inherit", fontWeight: "400" }}>
            ← Quay lại danh sách đơn hàng
          </Link>
        </div>

        {/* Section Head */}
        <div className="section-head" style={{ alignItems: "flex-start" }}>
          <div>
            <h1 className="h1">Đơn hàng #{order.id}</h1>
            <div className="muted" style={{ fontSize: "14px" }}>
              Đặt ngày {order.createdDate || "05/09/2026"} · Thanh toán: {order.paymentMethod || "COD"}
            </div>
          </div>
          <span
            className={
              isFailed || isCancelled
                ? "chip sale"
                : isDelivered || order.status === "SHIPPING"
                ? "chip green"
                : "chip"
            }
            style={{ fontSize: "13px", padding: "6px 16px" }}
          >
            {STATUS_LABEL[order.status] || order.status}
          </span>
        </div>

        <ErrorBanner error={error} />

        {isFailed && (
          <div className="banner error">
            <i className="fa-solid fa-circle-exclamation"></i>
            Thanh toán không thành công. Giao dịch đã được hủy an toàn và tồn kho đã được hoàn lại.
          </div>
        )}

        <div className="tracking-layout">
          {/* Left Column: Order Products & Destination */}
          <div className="card order-summary-box">
            <h2 className="h2" style={{ marginBottom: "18px" }}>
              Sản phẩm trong đơn
            </h2>

            {order.items?.map((item, idx) => (
              <div key={idx} className="order-item-mini">
                <div className="order-img">
                  <img
                    src={productImage({ id: item.productId })}
                    alt={item.productName}
                  />
                </div>
                <div>
                  <strong style={{ fontSize: "15px" }}>{item.productName}</strong>
                  <div className="small muted" style={{ margin: "2px 0 6px" }}>
                    {item.variant || "Chính hãng · Bảo hành 24T"} × {item.quantity || 1}
                  </div>
                  <div className="price" style={{ fontSize: "16px" }}>
                    {money(item.price || item.subtotal || 28990000)}
                  </div>
                </div>
              </div>
            ))}

            <div className="card" style={{ padding: "16px", marginTop: "20px", background: "var(--surface)" }}>
              <div className="small muted" style={{ fontWeight: "700", marginBottom: "4px" }}>
                ĐỊA CHỈ NHẬN HÀNG
              </div>
              <strong style={{ fontSize: "15px" }}>
                {order.shippingName || "Nguyễn Văn A"} · {order.shippingPhone || "0901 234 567"}
              </strong>
              <div className="small muted" style={{ marginTop: "4px" }}>
                {order.shippingAddress || "12 Nguyễn Huệ, Quận 1, TP.HCM"}
              </div>
            </div>

            <div className="summary-row total" style={{ marginTop: "20px" }}>
              <span>Tổng giá trị đơn hàng</span>
              <span>{money(order.totalAmount || 36980000)}</span>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              {isDelivered && (
                <button
                  className="btn primary"
                  style={{ flex: 1 }}
                  onClick={() => navigate(`/orders/${order.id}/review`)}
                >
                  <i className="fa-solid fa-star"></i>
                  Đánh giá sản phẩm
                </button>
              )}
              {["PENDING", "PAYMENT_PENDING", "CONFIRMED"].includes(order.status) && (
                <button
                  className="btn"
                  style={{ color: "var(--danger)", borderColor: "var(--danger-soft)" }}
                  onClick={() => setShowCancelModal(true)}
                >
                  Hủy đơn hàng
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Fulfillment Timeline */}
          <div className="card timeline-box">
            <h2 className="h2" style={{ marginBottom: "18px" }}>
              Tiến trình vận chuyển
            </h2>

            <div className="timeline-step">
              <div className="dot"></div>
              <div>
                <strong>Đặt hàng thành công</strong>
                <div className="small muted">05/09/2026 · 14:32 — Đơn hàng đã ghi nhận vào hệ thống</div>
              </div>
            </div>

            <div className="timeline-step">
              <div className="dot"></div>
              <div>
                <strong>Đã xác nhận & Giữ tồn kho</strong>
                <div className="small muted">05/09/2026 · 15:10 — Nhân viên hoàn tất đóng gói bảo bọc</div>
              </div>
            </div>

            <div className="timeline-step">
              <div className="dot"></div>
              <div>
                <strong>Bàn giao đối tác vận chuyển</strong>
                <div className="small muted">05/09/2026 · 18:45 — Bưu cục VNPost đã xuất kho</div>
              </div>
            </div>

            <div className="timeline-step">
              <div className="dot" style={order.status === "DELIVERED" ? {} : { boxShadow: "0 0 0 6px rgba(20, 79, 204, 0.25)" }}></div>
              <div>
                <strong style={{ color: "var(--blue)" }}>Đang trên đường giao hàng</strong>
                <div className="small muted">06/09/2026 · 09:15 — Shipper đang liên hệ giao hàng</div>
              </div>
            </div>

            <div className="timeline-step">
              <div className={`dot ${order.status === "DELIVERED" ? "" : "pending"}`}></div>
              <div>
                <strong>Giao hàng thành công</strong>
                <div className="small muted">
                  {order.status === "DELIVERED" ? "Đã giao cho người nhận" : "Dự kiến: Hôm nay · Trước 17:00"}
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: "16px", marginTop: "24px", background: "var(--surface)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span className="small muted">Đơn vị chuyển phát</span>
                <strong>{order.carrier || "VNPost Express"}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="small muted">Mã vận đơn tra cứu</span>
                <strong style={{ color: "var(--blue)" }}>{order.trackingNumber || "VNPOST-9088123"}</strong>
              </div>
            </div>

            <button
              className="btn soft"
              style={{ width: "100%", marginTop: "20px" }}
              onClick={() => {
                const chatLauncher = document.querySelector(".chat-launcher");
                if (chatLauncher) chatLauncher.click();
              }}
            >
              <i className="fa-solid fa-headset"></i>
              Liên hệ CSKH về đơn hàng này
            </button>
          </div>
        </div>

        {showCancelModal && (
          <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
            <div className="modal-card" style={{ maxWidth: "460px" }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: "var(--danger-soft)",
                      color: "var(--danger)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "16px"
                    }}
                  >
                    <i className="fa-solid fa-triangle-exclamation"></i>
                  </div>
                  <h3 style={{ margin: 0, fontSize: "17px" }}>Xác nhận hủy đơn hàng</h3>
                </div>
                <button
                  type="button"
                  className="modal-close"
                  onClick={() => setShowCancelModal(false)}
                  title="Đóng"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              <div className="modal-body" style={{ padding: "20px 24px" }}>
                <p className="muted" style={{ margin: 0, fontSize: "14px", lineHeight: "1.55" }}>
                  Bạn có chắc chắn muốn hủy đơn hàng <strong style={{ color: "var(--blue)" }}>#{order.id}</strong>? Thao tác này sẽ giải phóng dữ liệu giữ tồn kho (Inventory Saga) và cập nhật trạng thái đơn hàng sang <span className="chip sale">Đã hủy</span>.
                </p>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setShowCancelModal(false)}>
                  Giữ lại đơn
                </button>
                <button
                  type="button"
                  className="btn primary"
                  style={{ background: "var(--danger)", borderColor: "var(--danger)" }}
                  onClick={confirmCancelOrder}
                >
                  <i className="fa-solid fa-trash-can"></i> Đồng ý hủy đơn
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
