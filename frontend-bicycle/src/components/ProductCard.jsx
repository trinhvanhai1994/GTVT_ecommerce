import { useRef } from "react";
import { Link } from "react-router-dom";
import { money } from "../data/bikes.js";

export default function ProductCard({ bike }) {
  const ref = useRef(null);

  const tilt = (e) => {
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ref.current.style.transform = `rotateY(${px * 10}deg) rotateX(${-py * 8}deg)`;
  };

  return (
    <Link
      to={`/bikes/${bike.id}`}
      className="card"
      ref={ref}
      onMouseMove={tilt}
      onMouseLeave={() => {
        ref.current.style.transform = "none";
      }}
    >
      <div className="card-media">
        <img src={bike.image} alt={bike.name} />
      </div>
      <div className="card-body">
        <div className="tag">
          {bike.brand} · {bike.tag}
        </div>
        <h3>{bike.name}</h3>
        <div className="meta">
          {bike.range} km · {bike.motor}
        </div>
        <div className="price">
          {money(bike.price)}
          {bike.priceOld ? (
            <s className="meta" style={{ marginLeft: 8, fontWeight: 500 }}>
              {money(bike.priceOld)}
            </s>
          ) : null}
        </div>
      </div>
      <i className="trail" />
    </Link>
  );
}
