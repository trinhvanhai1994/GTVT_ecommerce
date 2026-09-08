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
    content:
      "Máy nguyên seal chính hãng, bảo hành điện tử kích hoạt chuẩn 24 tháng. Màn hình Retina sắc nét, màu chuẩn cho thiết kế đồ họa. Mình render clip 4K trên Premiere rất mượt, máy chỉ ấm nhẹ không hề nghe tiếng quạt. Giao hàng hỏa tốc 2H đúng giờ.",
    photos: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80"
    ],
    likes: 36,
    isLiked: false,
    reply: {
      author: "Nexora Tech Care",
      date: "1 ngày trước",
      content:
        "Dạ Nexora Tech xin cảm ơn anh Tuấn Anh đã tin chọn sản phẩm! Chúc anh có những trải nghiệm làm việc và sáng tạo tuyệt vời cùng thiết bị ạ."
    }
  },
  {
    id: 2,
    author: "Trần Mai Linh",
    avatar: "ML",
    rating: 5,
    date: "5 ngày trước",
    verified: true,
    variant: "Starlight · 16GB / 512GB",
    title: "Màu Starlight cực kỳ sang, pin dùng gần 2 ngày",
    content:
      "Màu Starlight bên ngoài đẹp hơn trong ảnh rất nhiều, ánh vàng champagne nhẹ nhàng. Bàn phím gõ êm, trackpad rê đa điểm mượt vô đối. Pin dùng tác vụ văn phòng, lướt web, nghe nhạc từ 8h sáng đến 6h chiều vẫn còn hơn 55%. Rất đáng tiền!",
    photos: [
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80"
    ],
    likes: 21,
    isLiked: false,
    reply: null
  },
  {
    id: 3,
    author: "Hoàng Minh Đức",
    avatar: "MĐ",
    rating: 5,
    date: "1 tuần trước",
    verified: true,
    variant: "Space Gray · 24GB / 1TB",
    title: "Cấu hình 24GB RAM cân mượt mọi tác vụ lập trình & Docker",
    content:
      "Mình mua bản 24GB RAM để chạy Docker, bật đồng thời VS Code, Android Studio và hàng chục tab Chrome vẫn mượt mà không bị swap memory. Loa ngoài bass ấm, mic đàm thoại họp online chống ồn cực tốt. Dịch vụ hậu mãi bên shop rất chu đáo.",
    photos: [],
    likes: 15,
    isLiked: false,
    reply: {
      author: "Nexora Tech Care",
      date: "6 ngày trước",
      content:
        "Cảm ơn anh Minh Đức đã có đánh giá rất chi tiết về hiệu năng thực tế. Nexora luôn sẵn sàng hỗ trợ anh kỹ thuật 24/7 trong suốt quá trình sử dụng ạ!"
    }
  },
  {
    id: 4,
    author: "Lê Quốc Huy",
    avatar: "QH",
    rating: 4,
    date: "2 tuần trước",
    verified: true,
    variant: "Midnight · 16GB / 512GB",
    title: "Sản phẩm tốt, nhân viên tư vấn nhiệt tình",
    content:
      "Máy đẹp và chạy êm ru. Điểm trừ duy nhất là màu Midnight hơi dễ bám vân tay một chút, nhưng lau khăn microfiber là sạch ngay. Bù lại tặng kèm hub chuyển đổi xịn và freeship hỏa tốc.",
    photos: [],
    likes: 9,
    isLiked: false,
    reply: null
  }
];

export default function ProductReviews({ product }) {
  const { user, isAuthenticated } = useAuth();

  const [reviews, setReviews] = useState(SEED_REVIEWS);
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showModal, setShowModal] = useState(false);
  const [lightboxImg, setLightboxImg] = useState(null);
  const [toastMsg, setToastMsg] = useState("");

  // Review Form State
  const [rating, setRating] = useState(5);
  const [authorName, setAuthorName] = useState(user?.fullName || "");
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [uploadedPhotos, setUploadedPhotos] = useState([]);

  // Stats calculation
  const totalReviews = 328 + (reviews.length - SEED_REVIEWS.length);
  const averageRating = 4.9;

  const distribution = [
    { stars: 5, percent: 88, count: 288 },
    { stars: 4, percent: 9, count: 30 },
    { stars: 3, percent: 2, count: 7 },
    { stars: 2, percent: 1, count: 2 },
    { stars: 1, percent: 0, count: 1 }
  ];

  const handleLike = (id) => {
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const nextLiked = !r.isLiked;
          return {
            ...r,
            isLiked: nextLiked,
            likes: nextLiked ? r.likes + 1 : r.likes - 1
          };
        }
        return r;
      })
    );
  };

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedPhotos((prev) => [...prev, event.target.result].slice(0, 4));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeUploadedPhoto = (index) => {
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const newReview = {
      id: Date.now(),
      author: authorName.trim() || user?.fullName || "Khách hàng Nexora",
      avatar: (authorName.trim() || "KH")
        .split(" ")
        .slice(-2)
        .map((w) => w.charAt(0))
        .join("")
        .toUpperCase(),
      rating,
      date: "Vừa xong",
      verified: true,
      variant: "Hàng chính hãng Nexora",
      title: title.trim() || (rating >= 4 ? "Sản phẩm tuyệt vời!" : "Đánh giá sản phẩm"),
      content: comment.trim(),
      photos: uploadedPhotos,
      likes: 1,
      isLiked: true,
      reply: {
        author: "Nexora Tech Care",
        date: "Vừa xong",
        content:
          "Cảm ơn bạn đã gửi đánh giá! Ý kiến của bạn là động lực để Nexora tiếp tục nâng cao chất lượng dịch vụ."
      }
    };

    setReviews([newReview, ...reviews]);
    setShowModal(false);
    setTitle("");
    setComment("");
    setUploadedPhotos([]);
    setRating(5);

    setToastMsg("Gửi đánh giá thành công! Cảm ơn bạn đã chia sẻ trải nghiệm.");
    setTimeout(() => setToastMsg(""), 4000);
  };

  // Filter and Sort logic
  const filteredReviews = reviews.filter((r) => {
    if (activeFilter === "photo") return r.photos && r.photos.length > 0;
    if (activeFilter === "5") return r.rating === 5;
    if (activeFilter === "4") return r.rating === 4;
    if (activeFilter === "3") return r.rating <= 3;
    return true;
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === "likes") return b.likes - a.likes;
    if (sortBy === "rating-desc") return b.rating - a.rating;
    return b.id - a.id; // newest
  });

  return (
    <section className="product-reviews-section" id="reviews-section">
      {toastMsg && (
        <div className="banner ok" style={{ marginBottom: "20px", animation: "slideIn 0.25s ease" }}>
          <i className="fa-solid fa-circle-check"></i>
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="section-head" style={{ marginBottom: "24px" }}>
        <div>
          <h2 className="h2" style={{ margin: "0 0 6px" }}>
            Khách hàng đánh giá & nhận xét
          </h2>
          <p className="muted small" style={{ margin: 0 }}>
            Tất cả đánh giá đều đến từ khách hàng đã mua và trải nghiệm thực tế tại NEXORA TECH
          </p>
        </div>
      </div>

      {/* Ratings Summary Card */}
      <div className="reviews-summary-card">
        {/* Left: Overall score */}
        <div className="review-score-box">
          <div className="review-big-score">{averageRating}</div>
          <div className="stars-gold">
            {"★".repeat(5)}
          </div>
          <div className="review-total-count">{totalReviews} đánh giá thực tế</div>
          <div className="review-recommend-chip">
            <i className="fa-solid fa-thumbs-up"></i> 98% khách hàng hài lòng
          </div>
        </div>

        {/* Center: Rating distribution bars */}
        <div className="review-bars-box">
          {distribution.map((d) => (
            <div
              key={d.stars}
              className={`review-bar-row ${activeFilter === String(d.stars) ? "active" : ""}`}
              onClick={() => setActiveFilter(activeFilter === String(d.stars) ? "all" : String(d.stars))}
              title={`Lọc theo ${d.stars} sao`}
            >
              <span className="bar-star-label">
                {d.stars} <i className="fa-solid fa-star"></i>
              </span>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${d.percent}%` }}></div>
              </div>
              <span className="bar-percent-label">{d.count}</span>
            </div>
          ))}
        </div>

        {/* Right: Write Review CTA */}
        <div className="review-cta-box">
          <div className="review-cta-text">
            Bạn đã trải nghiệm sản phẩm này? Hãy chia sẻ cảm nhận để giúp mọi người nhé!
          </div>
          <button
            type="button"
            className="btn primary review-write-btn"
            onClick={() => setShowModal(true)}
          >
            <i className="fa-solid fa-pen-to-square"></i> Viết đánh giá ngay
          </button>
          <div className="review-voucher-hint">
            <i className="fa-solid fa-gift"></i> Tặng voucher 50.000₫ khi có hình ảnh
          </div>
        </div>
      </div>

      {/* Filter Chips & Sort Bar */}
      <div className="reviews-toolbar">
        <div className="reviews-filter-chips">
          <button
            type="button"
            className={`filter-chip ${activeFilter === "all" ? "active" : ""}`}
            onClick={() => setActiveFilter("all")}
          >
            Tất cả ({reviews.length})
          </button>
          <button
            type="button"
            className={`filter-chip ${activeFilter === "photo" ? "active" : ""}`}
            onClick={() => setActiveFilter("photo")}
          >
            <i className="fa-solid fa-camera"></i> Có hình ảnh ({reviews.filter((r) => r.photos?.length > 0).length})
          </button>
          <button
            type="button"
            className={`filter-chip ${activeFilter === "5" ? "active" : ""}`}
            onClick={() => setActiveFilter("5")}
          >
            5 sao ({reviews.filter((r) => r.rating === 5).length})
          </button>
          <button
            type="button"
            className={`filter-chip ${activeFilter === "4" ? "active" : ""}`}
            onClick={() => setActiveFilter("4")}
          >
            4 sao ({reviews.filter((r) => r.rating === 4).length})
          </button>
        </div>

        <div className="reviews-sort-wrap">
          <span className="small muted">Sắp xếp:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="reviews-sort-select"
          >
            <option value="newest">Mới nhất</option>
            <option value="likes">Hữu ích nhất</option>
            <option value="rating-desc">Đánh giá cao nhất</option>
          </select>
        </div>
      </div>

      {/* Review List */}
      <div className="reviews-list">
        {sortedReviews.length === 0 ? (
          <div className="empty-state" style={{ padding: "40px" }}>
            <div className="empty-icon">
              <i className="fa-solid fa-comments"></i>
            </div>
            <h4>Không có đánh giá nào phù hợp với bộ lọc</h4>
            <button
              type="button"
              className="btn soft"
              style={{ marginTop: "12px" }}
              onClick={() => setActiveFilter("all")}
            >
              Xem tất cả đánh giá
            </button>
          </div>
        ) : (
          sortedReviews.map((rev) => (
            <div key={rev.id} className="review-item-card">
              {/* Header: User Info & Rating */}
              <div className="review-item-head">
                <div className="review-author-info">
                  <div className="review-avatar">{rev.avatar}</div>
                  <div>
                    <div className="review-author-name-row">
                      <strong className="review-author-name">{rev.author}</strong>
                      {rev.verified && (
                        <span className="verified-badge">
                          <i className="fa-solid fa-circle-check"></i> Đã mua hàng chính hãng
                        </span>
                      )}
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

              {/* Title & Body */}
              <div className="review-item-body">
                {rev.title && <h4 className="review-item-title">{rev.title}</h4>}
                <p className="review-item-content">{rev.content}</p>

                {/* Photos */}
                {rev.photos && rev.photos.length > 0 && (
                  <div className="review-photos-list">
                    {rev.photos.map((img, idx) => (
                      <div
                        key={idx}
                        className="review-photo-item"
                        onClick={() => setLightboxImg(img)}
                        title="Bấm để xem ảnh phóng to"
                      >
                        <img src={img} alt={`Đánh giá của ${rev.author} ${idx + 1}`} />
                        <div className="photo-zoom-overlay">
                          <i className="fa-solid fa-magnifying-glass-plus"></i>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Official Store Reply */}
                {rev.reply && (
                  <div className="review-store-reply">
                    <div className="store-reply-head">
                      <i className="fa-solid fa-shield-halved"></i>
                      <strong>{rev.reply.author}</strong>
                      <span className="small muted">· {rev.reply.date}</span>
                    </div>
                    <p className="store-reply-content">{rev.reply.content}</p>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="review-item-foot">
                <button
                  type="button"
                  className={`review-like-btn ${rev.isLiked ? "liked" : ""}`}
                  onClick={() => handleLike(rev.id)}
                >
                  <i className={`fa-${rev.isLiked ? "solid" : "regular"} fa-thumbs-up`}></i>
                  <span>Hữu ích ({rev.likes})</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Write Review Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" style={{ maxWidth: "620px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <h3>Đánh giá sản phẩm</h3>
                <span className="small muted">{product?.name || "Galaxy S24"}</span>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowModal(false)}
                title="Đóng"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleSubmitReview}>
              <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* Rating selection */}
                <div style={{ textAlign: "center", padding: "10px 0" }}>
                  <div style={{ fontSize: "14px", fontWeight: "700", marginBottom: "8px", color: "var(--ink)" }}>
                    Bạn cảm thấy sản phẩm này thế nào?
                  </div>
                  <div className="rating-star-picker">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        className={`star-pick-btn ${s <= rating ? "active" : ""}`}
                        onClick={() => setRating(s)}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <div className="rating-text-status">
                    {rating === 5 && "⭐ Tuyệt vời! Rất hài lòng"}
                    {rating === 4 && "👍 Hài lòng, sản phẩm tốt"}
                    {rating === 3 && "👌 Tạm ổn, đúng mô tả"}
                    {rating === 2 && "👎 Chưa hài lòng lắm"}
                    {rating === 1 && "❌ Rất thất vọng"}
                  </div>
                </div>

                {/* Author Name */}
                <div className="field">
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>
                    Họ và tên của bạn
                  </label>
                  <input
                    className="inputbox"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Nhập họ và tên"
                    required
                  />
                </div>

                {/* Review Title */}
                <div className="field">
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>
                    Tiêu đề đánh giá
                  </label>
                  <input
                    className="inputbox"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Tóm tắt ngắn gọn cảm nhận của bạn (Ví dụ: Máy mượt, pin trâu)"
                  />
                </div>

                {/* Content */}
                <div className="field">
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>
                    Nhận xét chi tiết <span style={{ color: "var(--danger)" }}>*</span>
                  </label>
                  <textarea
                    className="inputbox"
                    style={{ height: "110px", resize: "vertical" }}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Chia sẻ về thiết kế, thời lượng pin, tốc độ máy, chất lượng dịch vụ giao hàng..."
                    required
                    minLength={10}
                  ></textarea>
                </div>

                {/* Photo Upload */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "8px" }}>
                    Hình ảnh thực tế (Tùy chọn, tối đa 4 ảnh)
                  </label>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                    {uploadedPhotos.map((src, idx) => (
                      <div key={idx} style={{ position: "relative", width: "70px", height: "70px", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--line)" }}>
                        <img src={src} alt="Upload preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <button
                          type="button"
                          onClick={() => removeUploadedPhoto(idx)}
                          style={{ position: "absolute", top: "2px", right: "2px", background: "rgba(0,0,0,0.6)", color: "#fff", border: 0, borderRadius: "50%", width: "18px", height: "18px", fontSize: "10px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    {uploadedPhotos.length < 4 && (
                      <label style={{ width: "70px", height: "70px", borderRadius: "8px", border: "1.5px dashed var(--line)", background: "var(--surface)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--muted)", fontSize: "11px", gap: "4px" }}>
                        <i className="fa-solid fa-camera" style={{ fontSize: "16px" }}></i>
                        <span>Thêm ảnh</span>
                        <input type="file" accept="image/*" multiple onChange={handlePhotoSelect} style={{ display: "none" }} />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ padding: "16px 24px", borderTop: "1px solid var(--line)", display: "flex", justifyContent: "flex-end", gap: "12px", background: "var(--surface)" }}>
                <button type="button" className="btn" onClick={() => setShowModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn primary">
                  <i className="fa-solid fa-paper-plane"></i> Gửi đánh giá ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Lightbox Modal */}
      {lightboxImg && (
        <div className="modal-overlay" onClick={() => setLightboxImg(null)} style={{ background: "rgba(0, 0, 0, 0.85)" }}>
          <div style={{ position: "relative", maxWidth: "85vw", maxHeight: "85vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img
              src={lightboxImg}
              alt="Ảnh thực tế"
              style={{ maxWidth: "100%", maxHeight: "85vh", objectFit: "contain", borderRadius: "12px", boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              type="button"
              onClick={() => setLightboxImg(null)}
              style={{ position: "absolute", top: "-40px", right: "0", background: "rgba(255,255,255,0.2)", color: "#fff", border: 0, borderRadius: "50%", width: "36px", height: "36px", fontSize: "18px", cursor: "pointer" }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
