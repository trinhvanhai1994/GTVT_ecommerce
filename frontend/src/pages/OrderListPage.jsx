import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { Empty, ErrorBanner, Loading } from "../components/Feedback";
import { money, STATUS_LABEL } from "../utils/catalog";

const MOCK_ORDERS = [
  {
    id: "NX25090701",
    createdDate: "05/09/2026",
    itemCount: 2,
    status: "SHIPPING",
    totalAmount: 36980000,
    items: [
      { productName: "Apple MacBook Air 13 M4", quantity: 1 },
      { productName: "Sony WH-1000XM6 Wireless", quantity: 1 }
    ]
  },
  {
    id: "NX25090318",
    createdDate: "03/09/2026",
    itemCount: 1,
    status: "DELIVERED",
    totalAmount: 8990000,
    items: [{ productName: "Sony WH-1000XM6 Wireless", quantity: 1 }]
  },
  {
    id: "NX25082944",
    createdDate: "29/08/2026",
    itemCount: 1,
    status: "CANCELLED",
    totalAmount: 21990000,
    items: [{ productName: "Acer Swift Go 14 AI", quantity: 1 }]
  }
];

export default function OrderListPage() {
  const [orders, setOrders] = useState([]);
  const [selectedTab, setSelectedTab] = useState("ALL");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/orders")
      .then((res) => {
        const list = res.data?.data || [];
        if (list.length > 0) {
          setOrders(list);
        } else {
          setOrders(MOCK_ORDERS);
        }
      })
      .catch(() => {
        setOrders(MOCK_ORDERS);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredOrders = orders.filter((o) => {
    if (selectedTab === "ALL") return true;
    if (selectedTab === "PENDING") return ["PENDING", "PAYMENT_PENDING"].includes(o.status);
    if (selectedTab === "PROCESSING") return o.status === "PROCESSING" || o.status === "CONFIRMED";
    if (selectedTab === "SHIPPING") return o.status === "SHIPPING";
    if (selectedTab === "DELIVERED") return o.status === "DELIVERED";
    if (selectedTab === "CANCELLED") return o.status === "CANCELLED" || o.status === "PAYMENT_FAILED";
    return true;
  });

  const getChipClass = (status) => {
    if (status === "SHIPPING" || status === "DELIVERED") return "chip green";
    if (status === "CANCELLED" || status === "PAYMENT_FAILED") return "chip sale";
    return "chip";
  };

  return (
    <div className="page">
      <div className="container">
        <h1 className="h1">Lịch sử đơn hàng</h1>
        <p className="muted">Theo dõi trạng thái giao hàng, xem chi tiết và đánh giá sản phẩm đã mua.</p>

        <ErrorBanner error={error} />

        {/* Order Tabs */}
        <div className="order-tabs">
          {[
            { id: "ALL", label: "Tất cả đơn hàng" },
            { id: "PENDING", label: "Chờ thanh toán" },
            { id: "PROCESSING", label: "Đang xử lý" },
            { id: "SHIPPING", label: "Đang giao hàng" },
            { id: "DELIVERED", label: "Đã giao thành công" },
            { id: "CANCELLED", label: "Đã hủy" }
          ].map((tab) => (
            <span
              key={tab.id}
              className={`chip ${selectedTab === tab.id ? "" : "soft"}`}
              style={{
                cursor: "pointer",
                padding: "8px 16px",
                background: selectedTab === tab.id ? "var(--blue)" : "var(--surface)",
                color: selectedTab === tab.id ? "#fff" : "var(--ink)",
                border: "1px solid var(--line)"
              }}
              onClick={() => setSelectedTab(tab.id)}
            >
              {tab.label}
            </span>
          ))}
        </div>

        {loading ? (
          <Loading />
        ) : filteredOrders.length === 0 ? (
          <Empty
            title="Không có đơn hàng nào"
            text="Bạn chưa có đơn hàng nào trong danh mục này."
            action={
              <Link className="btn primary" to="/products">
                Khám phá sản phẩm
              </Link>
            }
          />
        ) : (
          <div className="order-list">
            {filteredOrders.map((o) => (
              <div key={o.id} className="card order-row">
                <div>
                  <h3 className="h3" style={{ color: "var(--blue)" }}>
                    #{o.id}
                  </h3>
                  <div className="small muted">
                    {o.createdDate || "05/09/2026"} · {o.items?.length || o.itemCount || 1} sản phẩm
                  </div>
                  <div className="small" style={{ marginTop: "6px", color: "var(--muted)" }}>
                    {o.items?.map((item) => item.productName).join(", ") || "Thiết bị công nghệ cao cấp"}
                  </div>
                </div>

                <div className="order-right">
                  <span className={getChipClass(o.status)}>
                    {STATUS_LABEL[o.status] || o.status}
                  </span>
                  <strong style={{ fontSize: "17px" }}>{money(o.totalAmount)}</strong>

                  {o.status === "SHIPPING" ? (
                    <button className="btn primary" onClick={() => navigate(`/orders/${o.id}`)}>
                      <i className="fa-solid fa-truck-fast"></i>
                      Theo dõi
                    </button>
                  ) : o.status === "DELIVERED" ? (
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button className="btn soft" onClick={() => navigate(`/orders/${o.id}/review`)}>
                        <i className="fa-solid fa-star"></i>
                        Đánh giá
                      </button>
                      <button className="btn" onClick={() => navigate(`/orders/${o.id}`)}>
                        Chi tiết
                      </button>
                    </div>
                  ) : (
                    <button className="btn" onClick={() => navigate(`/orders/${o.id}`)}>
                      Chi tiết
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
