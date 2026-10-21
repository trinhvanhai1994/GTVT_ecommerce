import { labelOf, STATUS_LABEL } from "../../utils/catalog";

const TONE = {
  PENDING: "warn",
  PAYMENT_PENDING: "warn",
  CONFIRMED: "ok",
  PROCESSING: "ok",
  SHIPPING: "ok",
  DELIVERED: "done",
  CANCELLED: "muted",
  PAYMENT_FAILED: "danger",
  ACTIVE: "ok",
  INACTIVE: "muted"
};

export default function StatusChip({ status, labels = STATUS_LABEL }) {
  const key = String(status || "").toUpperCase();
  const tone = TONE[key] || "muted";
  return <span className={`seller-chip seller-chip-${tone}`}>{labelOf(labels, key) || status}</span>;
}
