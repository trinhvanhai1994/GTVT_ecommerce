import { art, bikes, storeInfo } from "../data/bikes.js";
import MagneticButton from "../components/MagneticButton.jsx";
import EnergyCanvas from "../components/EnergyCanvas.jsx";
import ProductCard from "../components/ProductCard.jsx";

const hero = bikes[0];

export default function HomePage() {
  return (
    <div className="page-enter">
      <section className="hero">
        <EnergyCanvas />
        <div className="hero-grid">
          <div>
            <div className="kicker">
              <i className="pulse" /> Bluera Việt Nhật · dailyxedien.vn
            </div>
            <h1>
              <span className="line">
                <span>Xe đạp điện</span>
              </span>
              <span className="line">
                <span>Bluera BL8</span>
              </span>
              <span className="line">
                <span>chính hãng.</span>
              </span>
            </h1>
            <p className="lede">
              15 mẫu đang bán: BL8, S6, Cap Super Max, 133 IP6, Minion, Camelo, Swan, Bee U AI. Giá
              niêm yết từ Đại lý Xe Điện — trả góp 0%, ship toàn quốc.
            </p>
            <div className="hero-actions">
              <MagneticButton to={`/bikes/${hero.id}`}>Mua BL8 · 14 triệu</MagneticButton>
              <MagneticButton to="/shop" className="btn btn-ghost">
                15 mẫu xe
              </MagneticButton>
            </div>
            <div className="stats">
              <div>
                <b>500W</b>
                <span>Motor BL8</span>
              </div>
              <div>
                <b>50–60km</b>
                <span>Tầm pin</span>
              </div>
              <div>
                <b>NFC</b>
                <span>Khóa thông minh</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <img className="platform-art" src={art.platform} alt="" />
            <div className="hero-bike-wrap">
              <img className="hero-bike" src={hero.image} alt={hero.name} />
            </div>
            <div className="badge-float a">
              Giá bán
              <br />
              <strong>14.000.000đ</strong>
            </div>
            <div className="badge-float b">
              Hotline
              <br />
              <strong>{storeInfo.hotline}</strong>
            </div>
          </div>
        </div>
      </section>

      <div className="marquee">
        <div className="marquee-track">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i}>
              BLUERA BL8 · S6 · CAP SUPER MAX · 133 IP6 · MINION · CAMELO · SWAN AI · BEE U · TRẢ
              GÓP 0% · BLUERA BL8 ·
            </span>
          ))}
        </div>
      </div>

      <section>
        <div className="wrap">
          <div className="section-head">
            <h2>Đang bán</h2>
            <MagneticButton to="/shop" className="btn btn-ghost">
              Tất cả 15 mẫu
            </MagneticButton>
          </div>
          <div className="grid-bikes">
            {bikes.slice(0, 6).map((b) => (
              <ProductCard key={b.id} bike={b} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
