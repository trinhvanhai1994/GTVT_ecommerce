import { useMemo, useState } from "react";
import { bikes } from "../data/bikes.js";
import ProductCard from "../components/ProductCard.jsx";

const TAGS = ["All", "Flagship", "City", "AI", "Sport", "Mini"];

export default function ShopPage() {
  const [tag, setTag] = useState("All");
  const list = useMemo(
    () => (tag === "All" ? bikes : bikes.filter((b) => b.tag === tag)),
    [tag]
  );

  return (
    <section className="page-enter">
      <div className="wrap">
        <div className="section-head">
          <h2>Cửa hàng xe đạp điện Bluera</h2>
          <p className="lede">{list.length} mẫu · giá từ Đại lý Xe Điện Bluera Việt Nhật.</p>
        </div>
        <div className="filters">
          {TAGS.map((t) => (
            <button key={t} className={`chip ${tag === t ? "on" : ""}`} onClick={() => setTag(t)}>
              {t}
            </button>
          ))}
        </div>
        <div className="grid-bikes">
          {list.map((b) => (
            <ProductCard key={b.id} bike={b} />
          ))}
        </div>
      </div>
    </section>
  );
}
