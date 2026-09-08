import { storeInfo } from "../data/bikes.js";

export default function TechPage() {
  return (
    <section className="page-enter">
      <div className="wrap">
        <div className="kicker">
          <i className="pulse" /> Chính sách đại lý
        </div>
        <h2>Mua xe đạp điện Bluera chính hãng</h2>
        <p className="lede" style={{ marginTop: 16 }}>
          {storeInfo.company} (MST {storeInfo.tax}). Showroom: {storeInfo.address}. Giờ 8:00–20:00
          cả tuần.
        </p>
        <div className="specs">
          <div className="spec">
            <b>1 đổi 1 / 7 ngày</b>
            <span>Bảo hành · cứu hộ 24/7</span>
          </div>
          <div className="spec">
            <b>Ship toàn quốc</b>
            <span>Trả góp 0%</span>
          </div>
          <div className="spec">
            <b>{storeInfo.hotline}</b>
            <span>Hotline tư vấn</span>
          </div>
          <div className="spec">
            <b>{storeInfo.email}</b>
            <span>Email</span>
          </div>
        </div>
      </div>
    </section>
  );
}
