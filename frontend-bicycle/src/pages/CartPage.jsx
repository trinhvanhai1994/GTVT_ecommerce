import { Link } from "react-router-dom";
import { money } from "../data/bikes.js";
import { useCart } from "../context/CartContext.jsx";
import MagneticButton from "../components/MagneticButton.jsx";

export default function CartPage() {
  const { items, setQty, remove, total, count } = useCart();

  return (
    <section className="page-enter">
      <div className="wrap">
        <div className="section-head">
          <h2>Giỏ hàng</h2>
          <div>{count} sản phẩm</div>
        </div>
        {!items.length ? (
          <p className="empty">
            Chưa có xe nào. <Link to="/shop">Vào cửa hàng</Link>
          </p>
        ) : (
          <>
            <div className="cart-list">
              {items.map(({ id, qty, bike }) => (
                <div className="cart-row" key={id}>
                  <img src={bike.image} alt={bike.name} />
                  <div>
                    <h3>{bike.name}</h3>
                    <div className="meta">{bike.motor}</div>
                    <div className="qty">
                      <button onClick={() => setQty(id, qty - 1)}>−</button>
                      <strong>{qty}</strong>
                      <button onClick={() => setQty(id, qty + 1)}>+</button>
                      <button className="btn btn-ghost" onClick={() => remove(id)}>
                        Xóa
                      </button>
                    </div>
                  </div>
                  <div className="price">{money(bike.price * qty)}</div>
                </div>
              ))}
            </div>
            <div className="section-head" style={{ marginTop: 28 }}>
              <h3>Tổng {money(total)}</h3>
              <MagneticButton to="/checkout">Thanh toán</MagneticButton>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
