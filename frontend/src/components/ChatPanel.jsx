import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ChatPanel() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "support",
      text: "Xin chào! NEXORA TECH có thể hỗ trợ gì cho bạn hôm nay?",
      sub: "Chọn nhanh một chủ đề hoặc nhập câu hỏi bên dưới."
    }
  ]);
  const [input, setInput] = useState("");
  const navigate = useNavigate();

  const handleSend = (textToSend) => {
    const text = textToSend || input.trim();
    if (!text) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");

    // Simulate smart support responses
    setTimeout(() => {
      let replyText = "Cảm ơn bạn đã liên hệ! Chuyên viên tư vấn NEXORA sẽ hỗ trợ bạn ngay.";
      let actionLink = null;
      let actionLabel = null;

      const lower = text.toLowerCase();
      if (lower.includes("tư vấn") || lower.includes("laptop") || lower.includes("sản phẩm")) {
        replyText = "Nếu bạn tìm laptop mỏng nhẹ, pin trâu cho công việc và học tập, MacBook Air M4 16GB là lựa chọn tốt nhất hiện nay.";
        actionLink = "/products/1";
        actionLabel = "Xem MacBook Air M4 →";
      } else if (lower.includes("đơn hàng") || lower.includes("tra cứu") || lower.includes("vận chuyển")) {
        replyText = "Bạn có thể kiểm tra trực tiếp tiến trình giao hàng của các đơn hàng trong mục Lịch sử đơn hàng.";
        actionLink = "/orders";
        actionLabel = "Mở Lịch sử đơn hàng →";
      } else if (lower.includes("thanh toán") || lower.includes("trả góp")) {
        replyText = "NEXORA TECH hỗ trợ thanh toán khi nhận hàng (COD), thẻ Visa/Mastercard và trả góp lãi suất 0%.";
        actionLink = "/checkout";
        actionLabel = "Xem bước thanh toán →";
      } else if (lower.includes("bảo hành") || lower.includes("đổi trả")) {
        replyText = "Tất cả sản phẩm điện tử tại NEXORA TECH đều bảo hành chính hãng 12-24 tháng, lỗi 1 đổi 1 trong 7 ngày đầu.";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "support",
          text: replyText,
          actionLink,
          actionLabel
        }
      ]);
    }, 600);
  };

  return (
    <>
      <button
        className="chat-launcher"
        onClick={() => setOpen(!open)}
        aria-label="Mở chat hỗ trợ khách hàng"
      >
        <i className={open ? "fa-solid fa-xmark" : "fa-solid fa-headset"}></i>
      </button>

      {open && (
        <div className="chat-panel">
          <div className="chat-head">
            <div>
              <strong style={{ fontSize: "16px" }}>NEXORA Support</strong>
              <div className="small" style={{ color: "#a6c7ff", marginTop: "2px" }}>
                <span style={{ color: "#4ade80" }}>●</span> Đang trực tuyến · Sẵn sàng hỗ trợ
              </div>
            </div>
            <button
              className="btn soft"
              style={{ minHeight: "34px", padding: "0 10px", borderRadius: "8px", border: 0 }}
              onClick={() => setOpen(false)}
            >
              <i className="fa-solid fa-chevron-down"></i>
            </button>
          </div>

          <div className="chat-body">
            {messages.map((m) => (
              <div
                key={m.id}
                className={m.sender === "user" ? "message agent" : "message"}
              >
                <strong>{m.text}</strong>
                {m.sub && <div className="small muted" style={{ marginTop: "4px" }}>{m.sub}</div>}
                {m.actionLink && (
                  <button
                    className="btn soft"
                    style={{ marginTop: "8px", width: "100%", fontSize: "12px", minHeight: "34px" }}
                    onClick={() => {
                      setOpen(false);
                      navigate(m.actionLink);
                    }}
                  >
                    {m.actionLabel}
                  </button>
                )}
              </div>
            ))}

            <div className="small muted" style={{ fontWeight: "700", marginTop: "4px" }}>
              Gợi ý câu hỏi nhanh:
            </div>
            <div className="quick-grid">
              <button className="quick" onClick={() => handleSend("Tư vấn sản phẩm laptop")}>
                Tư vấn laptop
              </button>
              <button className="quick" onClick={() => handleSend("Tra cứu đơn hàng của tôi")}>
                Tra cứu đơn
              </button>
              <button className="quick" onClick={() => handleSend("Hình thức thanh toán")}>
                Thanh toán
              </button>
              <button className="quick" onClick={() => handleSend("Chính sách bảo hành và đổi trả")}>
                Bảo hành & đổi trả
              </button>
            </div>
          </div>

          <form
            className="chat-composer"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <input
              placeholder="Nhập tin nhắn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              className="btn primary"
              style={{ minHeight: "42px", padding: "0 14px", borderRadius: "10px" }}
              disabled={!input.trim()}
            >
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
