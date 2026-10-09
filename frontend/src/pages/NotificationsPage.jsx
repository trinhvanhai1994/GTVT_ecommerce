import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { Empty, ErrorBanner, Loading } from "../components/Feedback";
import { useAuth } from "../context/AuthContext";
import {
  CHANNEL_LABEL,
  EVENT_TYPE_LABEL,
  NOTIFY_STATUS_LABEL,
  formatWhen,
  labelOf
} from "../utils/catalog";
import { getLastSeenId, markNotificationsSeen } from "../utils/notifyRead";

export default function NotificationsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seenAtOpen, setSeenAtOpen] = useState(0);

  useEffect(() => {
    const lastBeforeOpen = getLastSeenId(user?.id);
    setSeenAtOpen(lastBeforeOpen);
    void api
      .get("/notifications")
      .then((res) => {
        const list = res.data.data || [];
        setItems(list);
        markNotificationsSeen(list, user?.id);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, [user?.id]);

  if (loading) return <Loading />;

  return (
    <section>
      <div className="page-title row-between">
        <div>
          <h1>Thông báo</h1>
          <p className="muted">Cập nhật đơn hàng và email gửi từ hệ thống.</p>
        </div>
        <Link className="btn btn-ghost btn-sm" to="/orders">
          Đơn hàng
        </Link>
      </div>
      <ErrorBanner error={error} />
      {items.length === 0 && (
        <Empty
          title="Chưa có thông báo"
          text="Sau khi đặt hàng, các sự kiện xác nhận / thanh toán sẽ hiện ở đây."
          action={
            <Link className="btn" to="/products">
              Mua sắm
            </Link>
          }
        />
      )}
      <ul className="order-list notify-list">
        {items.map((n) => {
          const unread = Number(n.id) > seenAtOpen;
          const typeLabel = labelOf(EVENT_TYPE_LABEL, n.eventType, "Thông báo");
          const channelLabel = labelOf(CHANNEL_LABEL, n.channel, "");
          const statusLabel = labelOf(NOTIFY_STATUS_LABEL, n.status, "");
          const title = labelOf(EVENT_TYPE_LABEL, n.eventType, n.title || typeLabel);
          return (
            <li key={n.id} className={unread ? "notify-item unread" : "notify-item"}>
              <div className="order-row">
                <div>
                  <strong>
                    {unread && <span className="notify-dot" aria-hidden />}
                    {title}
                  </strong>
                  <p className="muted">{n.message}</p>
                  <p className="muted tiny">
                    {formatWhen(n.createdAt)}
                    {channelLabel ? ` · ${channelLabel}` : ""}
                    {statusLabel ? ` · ${statusLabel}` : ""}
                    {n.referenceId ? ` · đơn #${n.referenceId}` : ""}
                  </p>
                </div>
                <span className={`status ${n.eventType || ""}`}>{typeLabel}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
