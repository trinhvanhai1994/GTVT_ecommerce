import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { productImage } from "../utils/catalog";

export default function ReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("Sản phẩm rất tốt, giao hàng siêu nhanh!");
  const [content, setContent] = useState(
    "Máy nguyên seal chính hãng, thiết kế sang trọng, hiệu năng mượt mà, pin trâu và màn hình hiển thị rất đẹp. Đóng gói cẩn thận 2 lớp chống sốc."
  );
  const [submitted, setSubmitted] = useState(false);
  const [photos, setPhotos] = useState([
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80"
  ]);

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotos((prev) => [...prev, event.target.result].slice(0, 5));
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      navigate("/orders");
    }, 1200);
  };

  return (
    <div className="page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="small muted" style={{ marginBottom: "16px" }}>
          <Link to="/orders" className="link" style={{ color: "inherit", fontWeight: "400" }}>
            ← Quay lại Lịch sử đơn hàng
          </Link>
        </div>

        <h1 className="h1">Đánh giá sản phẩm</h1>
        <p className="muted" style={{ marginBottom: "28px" }}>
          Chia sẻ trải nghiệm thực tế để giúp cộng đồng người dùng công nghệ chọn đúng sản phẩm.
        </p>

        {submitted ? (
          <div className="card review-card" style={{ textAlign: "center", padding: "48px 24px" }}>
            <i className="fa-solid fa-circle-check fa-3x" style={{ color: "var(--green)", marginBottom: "16px" }}></i>
            <h2 className="h2">Cảm ơn bạn đã gửi đánh giá!</h2>
            <p className="muted">Ý kiến của bạn đã được ghi nhận và đóng góp cho chất lượng phục vụ của NEXORA TECH.</p>
          </div>
        ) : (
          <form className="card review-card" onSubmit={handleSubmit}>
            <div className="review-product">
              <div className="review-img">
                <img
                  src={productImage({ id: 1 })}
                  alt="Apple MacBook Air 13 M4"
                />
              </div>
              <div>
                <h3 className="h3">Apple MacBook Air 13 M4 (16GB / 512GB)</h3>
                <div className="small muted">
                  Đơn hàng #{id || "NX25090318"} · <span style={{ color: "var(--green)", fontWeight: "700" }}>✓ Đã mua hàng chính hãng</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: "24px", fontWeight: "700", fontSize: "15px" }}>
              Mức độ hài lòng của bạn
            </div>
            <div className="stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star ${star <= rating ? "active" : ""}`}
                  onClick={() => setRating(star)}
                >
                  ★
                </button>
              ))}
              <span className="small muted" style={{ alignSelf: "center", marginLeft: "8px", fontWeight: "700" }}>
                {rating === 5
                  ? "Tuyệt vời (5/5)"
                  : rating === 4
                  ? "Hài lòng (4/5)"
                  : rating === 3
                  ? "Bình thường (3/5)"
                  : "Cần cải thiện"}
              </span>
            </div>

            <div className="field">
              <label>Tiêu đề đánh giá</label>
              <input
                className="inputbox"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label>Nội dung chia sẻ chi tiết</label>
              <textarea
                placeholder="Chia sẻ cảm nhận về thiết kế, hiệu năng, đóng gói, thời gian giao hàng..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>

            <div style={{ marginTop: "20px" }}>
              <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", cursor: "pointer" }} className="btn">
                <i className="fa-solid fa-camera"></i>
                Thêm hình ảnh / video
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: "none" }}
                  onChange={handlePhotoUpload}
                />
              </label>
              <span className="small muted" style={{ marginLeft: "12px" }}>Tối đa 5 ảnh · Định dạng JPG/PNG</span>

              {photos.length > 0 && (
                <div style={{ display: "flex", gap: "10px", marginTop: "12px", flexWrap: "wrap" }}>
                  {photos.map((src, i) => (
                    <div
                      key={i}
                      style={{
                        position: "relative",
                        width: "72px",
                        height: "72px",
                        borderRadius: "10px",
                        overflow: "hidden",
                        border: "1px solid var(--line)"
                      }}
                    >
                      <img src={src} alt={`Ảnh ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        style={{
                          position: "absolute",
                          top: "4px",
                          right: "4px",
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          background: "rgba(14, 18, 28, 0.75)",
                          color: "#fff",
                          border: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "10px"
                        }}
                        title="Xóa ảnh"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn primary"
              style={{ marginTop: "24px", minHeight: "48px", padding: "0 28px" }}
            >
              <i className="fa-solid fa-paper-plane"></i>
              Gửi đánh giá ngay
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
