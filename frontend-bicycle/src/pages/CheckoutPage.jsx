import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { money } from "../data/bikes.js";
import { useCart } from "../context/CartContext.jsx";

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const nav = useNavigate();
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <section className="page-enter wrap">
        <h2>Đặt xe thành công</h2>
        <p className="lede">VOLTRA sẽ gọi lịch giao xe điện và hướng dẫn sạc pin.</p>
      </section>
    );
  }

  return (
    <section className="page-enter">
      <div className="wrap">
        <h2>Thanh toán</h2>
        <p className="lede">Demo frontend — không gọi cổng thanh toán thật.</p>
        <div className="specs" style={{ maxWidth: 520, marginTop: 28 }}>
          <div className="spec">
            <b>{items.length}</b>
            <span>Dòng xe</span>
          </div>
          <div className="spec">
            <b>{money(total)}</b>
            <span>Tạm tính</span>
          </div>
        </div>
        <button
          className="btn btn-primary"
          style={{ marginTop: 24 }}
          disabled={!items.length}
          onClick={() => {
            clear();
            setDone(true);
            setTimeout(() => nav("/"), 1800);
          }}
        >
          Xác nhận đơn
        </button>
      </div>
    </section>
  );
}
