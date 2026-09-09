import { useState } from "react";
import { useNavigate } from "react-router-dom";

const REPLIES = [
  { kw: ["tư vấn", "laptop", "sản phẩm"], text: "MacBook Air M4 16GB là lựa chọn tốt nhất hiện nay cho công việc và học tập.", link: "/products/1", label: "Xem MacBook Air M4 →" },
  { kw: ["đơn hàng", "tra cứu", "vận chuyển"], text: "Bạn có thể kiểm tra trực tiếp tiến trình đơn hàng trong mục Lịch sử đơn hàng.", link: "/orders", label: "Mở Lịch sử đơn hàng →" },
  { kw: ["thanh toán", "trả góp"], text: "Hỗ trợ COD, thẻ Visa/Mastercard và trả góp lãi suất 0%.", link: "/checkout", label: "Xem bước thanh toán →" },
  { kw: ["bảo hành", "đổi trả"], text: "Bảo hành chính hãng 12-24 tháng, lỗi 1 đổi 1 trong 7 ngày đầu." }
];

export default function ChatPanel() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: "support", text: "Xin chào! NEXORA TECH có thể hỗ trợ gì cho bạn?", sub: "Chọn nhanh chủ đề hoặc nhập câu hỏi bên dưới." }
  ]);
  const [input, setInput] = useState("");
  const navigate = useNavigate();

  const handleSend = (textToSend) => {
    const text = textToSend || input.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { id: Date.now(), sender: "user", text }]);
    if (!textToSend) setInput("");

    setTimeout(() => {
      const lower = text.toLowerCase();
      const match = REPLIES.find((r) => r.kw.some((k) => lower.includes(k)));
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "support",
          text: match ? match.text : "Cảm ơn bạn đã liên hệ! Chuyên viên tư vấn sẽ phản hồi bạn ngay.",
          actionLink: match?.link,
          actionLabel: match?.label
        }
      ]);
    }, 400);
  };

  return (
    <>
      <button className="chat-launcher" onClick={() => setOpen(!open)} aria-label="Mở chat">
        <i className={open ? "fa-solid fa-xmark" : "fa-solid fa-headset"}></i>
      </button>

      {open && (
        <div className="chat-panel">
          <div className="chat-head">
            <div>
              <strong style={{ fontSize: 16 }}>NEXORA Support</strong>
              <div className="small" style={{ color: "#a6c7ff", marginTop: 2 }}>
                <span style={{ color: "#4ade80" }}>●</span> Sẵn sàng hỗ trợ
              </div>
            </div>
            <button className="btn soft" style={{ minHeight: 34, padding: "0 10px", border: 0 }} onClick={() => setOpen(false)}>
              <i className="fa-solid fa-chevron-down"></i>
            </button>
          </div>

          <div className="chat-body">
            {messages.map((m) => (
              <div key={m.id} className={m.sender === "user" ? "message agent" : "message"}>
                <strong>{m.text}</strong>
                {m.sub && <div className="small muted" style={{ marginTop: 4 }}>{m.sub}</div>}
                {m.actionLink && (
                  <button className="btn soft" style={{ marginTop: 8, width: "100%", fontSize: 12, minHeight: 34 }} onClick={() => { setOpen(false); navigate(m.actionLink); }}>
                    {m.actionLabel}
                  </button>
                )}
              </div>
            ))}

            <div className="small muted" style={{ fontWeight: 700, marginTop: 4 }}>Gợi ý nhanh:</div>
            <div className="quick-grid">
              {["Tư vấn laptop", "Tra cứu đơn hàng", "Hình thức thanh toán", "Bảo hành & đổi trả"].map((q) => (
                <button key={q} className="quick" onClick={() => handleSend(q)}>{q}</button>
              ))}
            </div>
          </div>

          <form className="chat-composer" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
            <input placeholder="Nhập tin nhắn..." value={input} onChange={(e) => setInput(e.target.value)} />
            <button type="submit" className="btn primary" style={{ minHeight: 42, padding: "0 14px", borderRadius: 10 }} disabled={!input.trim()}>
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
