import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const SEED_REVIEWS = [
  {
    id: 1,
    author: "Nguyễn Tuấn Anh",
    avatar: "TA",
    rating: 5,
    date: "2 ngày trước",
    verified: true,
    variant: "Midnight · 16GB / 512GB",
    title: "Hiệu năng vượt ngoài mong đợi, đóng gói siêu cẩn thận!",
    content: "Máy nguyên seal chính hãng, bảo hành 24 tháng. Màn hình sắc nét, render clip 4K rất mượt. Giao hàng hỏa tốc 2H đúng giờ.",
    photos: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80"],
    likes: 36,
    isLiked: false,
    reply: { author: "Nexora Tech Care", date: "1 ngày trước", content: "Cảm ơn anh Tuấn Anh đã tin chọn sản phẩm tại Nexora Tech!" }
  },
  {
    id: 2,
    author: "Trần Mai Linh",
    avatar: "ML",
    rating: 5,
    date: "5 ngày trước",
    verified: true,
    variant: "Starlight · 16GB / 512GB",
    title: "Màu Starlight cực sang, pin dùng cả ngày",
    content: "Bàn phím gõ êm, trackpad mượt. Pin làm việc văn phòng từ sáng đến chiều vẫn còn hơn 50%. Rất đáng tiền!",
    photos: [],
    likes: 21,
    isLiked: false,
    reply: null
  }
];

export default function ProductReviews({ product }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState(SEED_REVIEWS);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showModal, setShowModal] = useState(false);
  const [lightboxImg, setLightboxImg] = useState(null);
  const [toastMsg, setToastMsg] = useState("");

  const [rating, setRating] = useState(5);
  const [authorName, setAuthorName] = useState(user?.fullName || "");
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState([]);

  const handleLike = (id) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isLiked: !r.isLiked, likes: r.isLiked ? r.likes - 1 : r.likes + 1 } : r))
    );
  };

  const handlePhotoSelect = (e) => {
    Array.from(e.target.files || []).forEach((file) => {
      const r = new FileReader();
      r.onload = (ev) => setPhotos((p) => [...p, ev.target.result].slice(0, 4));
      r.readAsDataURL(file);
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    const author = authorName.trim() || user?.fullName || "Khách hàng Nexora";
    const newRev = {
      id: Date.now(),
      author,
      avatar: author.split(" ").slice(-2).map((w) => w[0]).join("").toUpperCase() || "KH",
      rating,
      date: "Vừa xong",
      verified: true,
      variant: "Hàng chính hãng Nexora",
      title: title.trim() || (rating >= 4 ? "Sản phẩm tuyệt vời!" : "Đánh giá sản phẩm"),
      content: comment.trim(),
      photos,
      likes: 1,
      isLiked: true,
      reply: null
    };
    setReviews([newRev, ...reviews]);
    setShowModal(false);
    setTitle("");
    setComment("");
    setPhotos([]);
    setRating(5);
    setToastMsg("Gửi đánh giá thành công! Cảm ơn bạn đã chia sẻ.");
    setTimeout(() => setToastMsg(""), 3500);
  };

  const filtered = reviews.filter((r) => {
    if (filter === "photo") return r.photos?.length > 0;
    if (filter === "5") return r.rating === 5;
    if (filter === "4") return r.rating === 4;
    return true;
  });

  const sorted = [...filtered].sort((a, b) =>
    sortBy === "likes" ? b.likes - a.likes : sortBy === "rating-desc" ? b.rating - a.rating : b.id - a.id
  );

  return (
    <section className="product-reviews-section" id="reviews-section">
      {toastMsg && (
        <div className="banner ok" style={{ marginBottom: 20 }}>
          <i className="fa-solid fa-circle-check"></i> {toastMsg}
        </div>
      )}

      <div className="section-head" style={{ marginBottom: 24 }}>
        <div>
          <h2 className="h2" style={{ margin: "0 0 6px" }}>Khách hàng đánh giá & nhận xét</h2>
          <p className="muted small" style={{ margin: 0 }}>Đánh giá thực tế từ khách hàng tại NEXORA TECH</p>
        </div>
      </div>

      <div className="reviews-summary-card">
        <div className="review-score-box">
          <div className="review-big-score">4.9</div>
          <div className="stars-gold">{"★".repeat(5)}</div>
          <div className="review-total-count">{328 + reviews.length - SEED_REVIEWS.length} đánh giá thực tế</div>
          <div className="review-recommend-chip"><i className="fa-solid fa-thumbs-up"></i> 98% hài lòng</div>
        </div>

        <div className="review-bars-box">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = reviews.filter((r) => r.rating === stars).length;
            const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
            return (
              <div key={stars} className={`review-bar-row ${filter === String(stars) ? "active" : ""}`} onClick={() => setFilter(filter === String(stars) ? "all" : String(stars))}>
                <span className="bar-star-label">{stars} <i className="fa-solid fa-star"></i></span>
                <div className="bar-track"><div className="bar-fill" style={{ width: `${stars === 5 ? 88 : stars === 4 ? 9 : 3}%` }}></div></div>
                <span className="bar-percent-label">{count || (stars === 5 ? 288 : stars === 4 ? 30 : 5)}</span>
              </div>
            );
          })}
        </div>

        <div className="review-cta-box">
          <div className="review-cta-text">Chia sẻ trải nghiệm của bạn để giúp cộng đồng mua sắm thông thái hơn!</div>
          <button type="button" className="btn primary review-write-btn" onClick={() => setShowModal(true)}>
            <i className="fa-solid fa-pen-to-square"></i> Viết đánh giá ngay
          </button>
        </div>
      </div>

      <div className="reviews-toolbar">
        <div className="reviews-filter-chips">
          {["all", "photo", "5", "4"].map((f) => (
            <button key={f} type="button" className={`filter-chip ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
              {f === "all" ? `Tất cả (${reviews.length})` : f === "photo" ? "Có hình ảnh" : `${f} sao`}
            </button>
          ))}
        </div>
        <div className="reviews-sort-wrap">
          <span className="small muted">Sắp xếp:</span>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="reviews-sort-select">
            <option value="newest">Mới nhất</option>
            <option value="likes">Hữu ích nhất</option>
            <option value="rating-desc">Đánh giá cao nhất</option>
          </select>
        </div>
      </div>

      <div className="reviews-list">
        {sorted.length === 0 ? (
          <div className="empty-state" style={{ padding: 40 }}>
            <h4>Không có đánh giá phù hợp</h4>
            <button type="button" className="btn soft" style={{ marginTop: 12 }} onClick={() => setFilter("all")}>Xem tất cả</button>
          </div>
        ) : (
          sorted.map((rev) => (
            <div key={rev.id} className="review-item-card">
              <div className="review-item-head">
                <div className="review-author-info">
                  <div className="review-avatar">{rev.avatar}</div>
                  <div>
                    <div className="review-author-name-row">
                      <strong className="review-author-name">{rev.author}</strong>
                      {rev.verified && <span className="verified-badge"><i className="fa-solid fa-circle-check"></i> Đã mua hàng</span>}
                    </div>
                    <div className="review-meta-row">
                      <span className="review-variant-tag">{rev.variant}</span>
                      <span className="review-date-dot">·</span>
                      <span className="review-date-text">{rev.date}</span>
                    </div>
                  </div>
                </div>
                <div className="review-stars-box">
                  <span className="stars-gold-sm">{"★".repeat(rev.rating)}</span>
                  <span className="review-score-number">{rev.rating}/5</span>
                </div>
              </div>

              <div className="review-item-body">
                {rev.title && <h4 className="review-item-title">{rev.title}</h4>}
                <p className="review-item-content">{rev.content}</p>
                {rev.photos?.length > 0 && (
                  <div className="review-photos-list">
                    {rev.photos.map((img, idx) => (
                      <div key={idx} className="review-photo-item" onClick={() => setLightboxImg(img)}>
                        <img src={img} alt="" />
                      </div>
                    ))}
                  </div>
                )}
                {rev.reply && (
                  <div className="review-store-reply">
                    <div className="store-reply-head"><i className="fa-solid fa-shield-halved"></i> <strong>{rev.reply.author}</strong></div>
                    <p className="store-reply-content">{rev.reply.content}</p>
                  </div>
                )}
              </div>

              <div className="review-item-foot">
                <button type="button" className={`review-like-btn ${rev.isLiked ? "liked" : ""}`} onClick={() => handleLike(rev.id)}>
                  <i className={`fa-${rev.isLiked ? "solid" : "regular"} fa-thumbs-up`}></i> <span>Hữu ích ({rev.likes})</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" style={{ maxWidth: 600 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Đánh giá: {product?.name || "Sản phẩm"}</h3>
              <button type="button" className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ textAlign: "center" }}>
                <div className="rating-star-picker">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} type="button" className={`star-pick-btn ${s <= rating ? "active" : ""}`} onClick={() => setRating(s)}>★</button>
                  ))}
                </div>
              </div>
              <input className="inputbox" value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="Họ và tên của bạn" required />
              <input className="inputbox" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tiêu đề (VD: Máy mượt, pin trâu)" />
              <textarea className="inputbox" style={{ height: 100 }} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Nhận xét chi tiết về sản phẩm..." required />
              <div>
                <input type="file" accept="image/*" multiple onChange={handlePhotoSelect} style={{ fontSize: 13 }} />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 8 }}>
                <button type="button" className="btn" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn primary"><i className="fa-solid fa-paper-plane"></i> Gửi đánh giá</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {lightboxImg && (
        <div className="modal-overlay" onClick={() => setLightboxImg(null)} style={{ background: "rgba(0,0,0,0.85)" }}>
          <img src={lightboxImg} alt="" style={{ maxWidth: "85vw", maxHeight: "85vh", borderRadius: 12 }} onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </section>
  );
}
