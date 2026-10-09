import { STATUS_LABEL } from "../utils/catalog";

const STEPS = [
  "PENDING",
  "PAYMENT_PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPING",
  "DELIVERED"
];

const FAIL = new Set(["PAYMENT_FAILED", "CANCELLED"]);

export default function OrderTimeline({ status }) {
  const current = String(status || "").toUpperCase();
  const failed = FAIL.has(current);
  const idx = STEPS.indexOf(current);

  return (
    <ol className="order-timeline">
      {STEPS.map((step, i) => {
        let state = "todo";
        if (failed) {
          state = i === 0 || (current === "PAYMENT_FAILED" && step === "PAYMENT_PENDING") ? "done" : "todo";
          if (step === "PAYMENT_PENDING" && current === "PAYMENT_FAILED") state = "fail";
          if (step === "PENDING" && current === "CANCELLED") state = "fail";
        } else if (idx >= 0) {
          if (i < idx) state = "done";
          else if (i === idx) state = "current";
        }
        return (
          <li key={step} className={`timeline-step ${state}`}>
            <span className="timeline-dot" />
            <span>{STATUS_LABEL[step] || step}</span>
          </li>
        );
      })}
      {failed && (
        <li className="timeline-step fail">
          <span className="timeline-dot" />
          <span>{STATUS_LABEL[current] || current}</span>
        </li>
      )}
    </ol>
  );
}
