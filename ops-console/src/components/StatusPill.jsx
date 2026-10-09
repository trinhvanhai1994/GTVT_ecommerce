const LABEL = {
  UP: "Đang chạy",
  DOWN: "Dừng / lỗi",
  STOPPED: "Đã stop",
  STARTING: "Đang khởi động",
  DEGRADED: "Suy giảm",
  UNKNOWN: "Chưa rõ"
};

export default function StatusPill({ status }) {
  const key = String(status || "UNKNOWN").toUpperCase();
  return <span className={`pill ${key}`}>{LABEL[key] || key}</span>;
}
