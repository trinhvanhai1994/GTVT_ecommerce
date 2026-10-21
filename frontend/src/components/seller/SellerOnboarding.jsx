import { SHOP_STATUS_LABEL, labelOf } from "../../utils/catalog";

const STEPS = [
  { id: "submit", label: "Gửi hồ sơ" },
  { id: "review", label: "Nava duyệt" },
  { id: "live", label: "Bán hàng" }
];

export default function SellerOnboarding({ shop }) {
  const status = shop?.status;
  let active = 0;
  if (status === "PENDING") active = 1;
  else if (status === "APPROVED") active = 2;
  else if (status === "REJECTED") active = 1;

  return (
    <section className="seller-onboarding">
      <p className="eyebrow">Kênh người bán</p>
      <h1>{shop?.name || "Gian hàng của bạn"}</h1>
      <p className="muted">
        Trạng thái: <strong>{labelOf(SHOP_STATUS_LABEL, status)}</strong>
        {shop?.rejectReason ? ` — ${shop.rejectReason}` : ""}
      </p>
      <ol className="seller-stepper">
        {STEPS.map((s, i) => (
          <li key={s.id} className={i < active ? "done" : i === active ? "current" : ""}>
            <span className="seller-step-dot" />
            {s.label}
          </li>
        ))}
      </ol>
      {status === "PENDING" && (
        <div className="admin-card">
          <p>
            Hồ sơ đang chờ duyệt. Email <strong>{shop.contactEmail || "shop"}</strong> sẽ nhận thông tin đăng nhập sau khi được duyệt.
          </p>
          <p className="muted">Bạn có thể đóng tab và quay lại sau — trạng thái cập nhật tự động khi F5.</p>
        </div>
      )}
      {status === "REJECTED" && (
        <div className="admin-card">
          <p>Hồ sơ chưa được duyệt. Liên hệ hỗ trợ sàn hoặc gửi lại sau khi bổ sung thông tin.</p>
        </div>
      )}
    </section>
  );
}
