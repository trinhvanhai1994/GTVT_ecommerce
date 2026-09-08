import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { art, getBike, money, storeInfo } from "../data/bikes.js";
import { useCart } from "../context/CartContext.jsx";
import MagneticButton from "../components/MagneticButton.jsx";

export default function ProductPage() {
  const { id } = useParams();
  const bike = getBike(id);
  const { add } = useCart();
  const nav = useNavigate();
  const [qty, setQty] = useState(1);
  const [color, setColor] = useState(bike?.colors?.[0] || "");

  if (!bike) {
    return (
      <section className="wrap">
        <p className="empty">Không tìm thấy mẫu xe.</p>
      </section>
    );
  }

  return (
    <section className="page-enter">
      <div className="wrap detail">
        <div className="detail-stage">
          <img className="platform-art detail-platform" src={art.platform} alt="" />
          <div className="detail-visual">
            <img src={bike.image} alt={bike.name} />
          </div>
        </div>
        <div>
          <div className="tag">
            {bike.brand} · {bike.tag}
          </div>
          <h2>{bike.name}</h2>
          <p className="lede" style={{ marginTop: 14 }}>
            {bike.blurb}
          </p>
          <div className="price" style={{ fontSize: 28, marginTop: 18 }}>
            {money(bike.price)}
            {bike.priceOld ? (
              <s className="meta" style={{ marginLeft: 10, fontSize: 16 }}>
                {money(bike.priceOld)}
              </s>
            ) : null}
          </div>
          {bike.colors?.length ? (
            <div className="filters" style={{ marginTop: 16 }}>
              {bike.colors.map((c) => (
                <button
                  key={c}
                  className={`chip ${color === c ? "on" : ""}`}
                  onClick={() => setColor(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          ) : null}
          <div className="specs">
            <div className="spec">
              <b>{bike.motor}</b>
              <span>Động cơ</span>
            </div>
            <div className="spec">
              <b>{bike.range} km</b>
              <span>Tầm (công bố)</span>
            </div>
            <div className="spec">
              <b>{bike.speed} km/h</b>
              <span>Tốc độ</span>
            </div>
            <div className="spec">
              <b>{bike.battery}</b>
              <span>Pin / ắc quy</span>
            </div>
          </div>
          <div className="qty">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
            <strong>{qty}</strong>
            <button onClick={() => setQty((q) => q + 1)}>+</button>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => {
              add(bike.id, qty);
              nav("/cart");
            }}
          >
            Thêm vào giỏ
          </button>
          <p className="meta" style={{ marginTop: 14 }}>
            Tư vấn: {storeInfo.hotline} · {storeInfo.address}
          </p>
          <div style={{ marginTop: 12 }}>
            <MagneticButton to="/shop" className="btn btn-ghost">
              Mẫu khác
            </MagneticButton>
          </div>
        </div>
      </div>
    </section>
  );
}
