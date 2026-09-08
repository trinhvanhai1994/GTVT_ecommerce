# Báo Cáo Tổng Hợp Toàn Bộ Thay Đổi Hệ Thống (Từ Khi Pull Code GitHub)

> **Dự án:** NEXORA TECH — Nền Tảng Thương Mại Điện Tử Thiết Bị Công Nghệ  
> **Kiến trúc:** Microservices (Spring Boot + Spring Cloud) & Single Page Application (React + Vite)  
> **Vị trí tài liệu:** `docs/design/CHANGELOG.md`  
> **Phạm vi:** Toàn bộ các thay đổi mã nguồn, cấu hình hệ thống, giao diện người dùng và luồng nghiệp vụ kể từ commit gốc `b329f8a` / `4b18673`.

---

## 1. Cấu Hình Hạ Tầng & Microservices (`docker-compose.yml`)
- **Loại bỏ Operations Console (Spring Cloud):** Loại bỏ dịch vụ `eureka-server` và `admin-server` không cần thiết khỏi `docker-compose.yml` theo yêu cầu tối ưu tài nguyên và tinh giản hệ thống.
- **Duy trì & kết nối các service lõi:**
  - `postgres` (Cơ sở dữ liệu trung tâm - Port 5432).
  - `api-gateway` (Spring Cloud Gateway - Port 8080).
  - `auth-service` (Spring Security + JWT - Port 8081).
  - `product-service` (Quản lý danh mục & sản phẩm - Port 8082).
  - `order-service` (Quản lý giỏ hàng, đơn hàng & thanh toán - Port 8083).
  - `frontend` (Nginx serving React SPA build - Port 5173).

---

## 2. Hệ Thống Thiết Kế Toàn Cục (Design System & Tokens)
- **Tập tin:** `frontend/src/index.css`, `frontend/index.html`
- **Bộ font & Icon:** Nhúng Google Font `Inter` chuẩn UI hiện đại và thư viện `FontAwesome 6 Pro`.
- **Bảng màu chủ đạo (Color Tokens):**
  - `--blue`: `#144FCC` (Màu thương hiệu, điểm nhấn, trạng thái active).
  - `--blue-2`: `#144FD1` (Nút bấm chính Primary CTA).
  - `--blue-soft`: `#E3EDFF` (Nền trạng thái active, huy hiệu, chip).
  - `--ink`: `#0E121C` (Màu chữ chính có độ tương phản cao).
  - `--muted`: `#616E85` (Màu chữ phụ, mô tả).
  - `--line`: `#DBE3ED` (Đường viền thẻ, phân cách).
  - `--surface`: `#F8F9FB` / `--surface-2`: `#F6F8FA` (Nền phụ, nền thẻ).
  - `--green` & `--green-soft`: Xử lý trạng thái thành công, giao hàng, còn hàng.
  - `--danger` & `--danger-soft`: Trạng thái giảm giá, cảnh báo, nút xóa, đăng xuất.
- **Thành phần dùng chung:** Hệ thống nút bấm (`.btn`), thẻ card (`.card`), chip trạng thái (`.chip`), thanh cuộn mượt mà (Custom scrollbars), modal overlay, thông báo toast, hiệu ứng shimmer loading.

---

## 3. Khung Giao Diện Dùng Chung (`Layout.jsx`)
- **Header thương hiệu:**
  - Logo `NEXORA TECH` kèm các liên kết danh mục nhanh: Laptop, Điện thoại, Audio, Gaming.
  - **Thanh tìm kiếm trung tâm:** Chiều rộng 440px, hiển thị trọn vẹn placeholder `Tìm sản phẩm, hãng, model...`, có nút xóa nhanh `✕`, đồng bộ giá trị với URL `?keyword=...`.
  - **Khắc phục lỗi viền:** Triệt tiêu hoàn toàn khung viền chữ nhật màu xanh mặc định do Chromium tự vẽ khi người dùng click vào ô input.
  - **Khu vực tác vụ:** Nút xem danh mục Sản phẩm, Đơn hàng của tôi, Giỏ hàng kèm badge số lượng thời gian thực, Menu tài khoản người dùng và Đăng xuất.
- **Scroll Restoration (Khôi phục vị trí cuộn trang):**
  - Tự động cuộn trang lên đỉnh (`window.scrollTo({ top: 0, left: 0, behavior: "instant" })`) khi chuyển route hoặc thay đổi URL query params, loại bỏ hoàn toàn lỗi người dùng bị rơi vào giữa trang.
- **Footer chuyên nghiệp:** Thông tin thương hiệu Nexora Tech, hệ thống liên kết sản phẩm, chính sách bảo hành, tổng đài hỗ trợ 1800 6868 và bản quyền.

---

## 4. Trợ Lý Khách Hàng Nổi (`ChatPanel.jsx`)
- **Nút mở chat launcher:** Nút tròn màu xanh thương hiệu cố định ở góc phải dưới (`position: fixed`).
- **Hộp thoại chat thông minh:**
  - Header nhân viên hỗ trợ trực tuyến (`Nexora Support Assistant`).
  - Gợi ý câu hỏi nhanh: *"Tra cứu đơn hàng"*, *"Chính sách bảo hành 24T"*, *"Giao hàng hỏa tốc 2H"*, *"Tư vấn cấu hình máy"*.
  - Khung nhắn tin tương tác và phản hồi tự động.

---

## 5. Trang Chủ (`HomePage.jsx`)
- **Hero Banner:** Tiêu đề công nghệ *"Công nghệ mới. Hiệu suất vượt trội."*, hình ảnh laptop 3D và nút CTA dẫn thẳng tới danh sách sản phẩm.
- **Danh mục nổi bật:** 5 khối danh mục công nghệ (Laptop, Điện thoại, Audio, Gaming Gear, Phụ kiện).
- **Thanh cam kết dịch vụ:** Giao nhanh 2H nội thành, Hàng chính hãng 100% VAT, Đổi trả 1-1 trong 7 ngày, Tư vấn cấu hình 24/7.
- **Khối Flash Sale công nghệ:**
  - Banner đỏ gradient nổi bật kèm **đồng hồ đếm ngược (Countdown Timer)** thời gian thực (Giờ : Phút : Giây).
  - Carousel sản phẩm giảm giá hiển thị badge `% Giảm`, thanh tiến độ `Đã bán`, nhãn `Giao nhanh 2H` và nút dẫn tới trang khuyến mãi.
- **Thương hiệu đồng hành (`BrandSlider.jsx`):**
  - Băng chuyền card logo các hãng công nghệ lớn (Apple, Asus, Dell, Lenovo, Samsung, Sony, MSI, LG).
  - Tối ưu kích thước card lớn, logo hiển thị rõ ràng, tốc độ chạy êm dịu (0.5).
  - Sử dụng `requestAnimationFrame` kết hợp `scrollPosRef` lưu số thực tránh lỗi animation bị đứng.
- **Lưới sản phẩm nổi bật:** Danh sách sản phẩm mới nhất với ảnh sắc nét, giá bán, giảm giá và đánh giá sao.

---

## 6. Trang Danh Sách Sản Phẩm & Bộ Lọc (`ProductListPage.jsx`)
- **Thanh công cụ lọc:**
  - Hiển thị số lượng kết quả tìm kiếm theo thời gian thực.
  - Ô tìm kiếm nhanh inline bên trong trang.
  - Dropdown sắp xếp đa dạng: Mới nhất, Giá tăng dần, Giá giảm dần, Bán chạy nhất.
- **Bộ lọc Sidebar (Faceted Filtering):**
  - **Sửa lỗi hiển thị số lượng:** Tính toán chính xác số lượng sản phẩm tương ứng với từng khoảng giá (ví dụ `< 20 triệu`, `20 - 30 triệu`, `> 30 triệu`).
  - **Khắc phục trùng lặp:** Chuẩn hóa gom nhóm các tên hãng trùng lặp (ví dụ `ASUS` và `Asus`).
  - **Chuẩn hóa tiền tệ:** Đồng bộ quy đổi tiền USD x 25.000 để giá bán và khoảng lọc khớp 100% dữ liệu backend.
  - **Thiết kế lại checkbox/radio:** Bỏ icon thừa `⌄`, thay bằng custom controls chuẩn CSS, hỗ trợ đóng/mở từng nhóm lọc.
- **Chế độ xem khuyến mãi (`?sale=true`):** Tự động lọc các sản phẩm có giảm giá và hiển thị tiêu đề trang phù hợp.
- **Phân trang Pager:** Chuyển trang mượt mà kèm cuộn lên đầu danh sách.

---

## 7. Trang Chi Tiết Sản Phẩm (`ProductDetailPage.jsx`)
- **Thư viện ảnh sản phẩm:** Ảnh chính chất lượng cao cùng 4 thumbnail chuyển đổi tức thì khi click.
- **Khối thông tin chi tiết:**
  - Tên máy, SKU, nhãn chính hãng 100%, đánh giá sao kèm liên kết cuộn nhanh xuống khối nhận xét.
  - Giá bán nổi bật, giá gốc gạch ngang và tỷ lệ tiết kiệm.
  - Tag giao nhanh 2H, thẻ Tình trạng máy (Mới 100% nguyên seal) và Thời hạn bảo hành 24 tháng.
- **Tùy chọn cấu hình tương tác:**
  - Bộ nhớ RAM (16GB, 24GB, 32GB Unified Memory).
  - Ổ cứng SSD (512GB, 1TB, 2TB NVMe).
  - Màu sắc hoàn thiện (Midnight, Starlight, Space Gray).
- **Hộp Quà tặng & Ưu đãi đặc quyền:** Giảm 10% phụ kiện, trả góp 0%, tặng gói cân màu màn hình, miễn phí ship 2H.
- **Hành động mua sắm:** Nút *Mua ngay* (chuyển thẳng giỏ hàng) và *Thêm vào giỏ hàng*.
- **Bảng Thông số kỹ thuật chi tiết:** Trình bày 8 thông số cốt lõi (CPU, RAM, SSD, GPU, Màn hình, Pin, Trọng lượng, Hệ điều hành).
- **Khối Đánh Giá & Nhận Xét Khách Hàng (`ProductReviews.jsx`):**
  - Bảng tổng quan điểm số `4.9 / 5`, 5 sao vàng, tổng 328 đánh giá và biểu đồ phân bổ mức sao trực quan (click lọc nhanh).
  - Chip lọc: Tất cả, Có hình ảnh, 5 sao, 4 sao; sắp xếp: Mới nhất, Hữu ích nhất, Đánh giá cao nhất.
  - Danh sách nhận xét có avatar, badge xác thực đã mua hàng, phiên bản máy, thư viện ảnh khách chụp có Lightbox phóng to.
  - Phản hồi chăm sóc khách hàng từ cửa hàng (`Nexora Tech Care`), nút bấm `👍 Hữu ích` tương tác trực tiếp.
  - Modal Viết đánh giá: Chọn 1 - 5 sao kèm mô tả cảm xúc, nhập họ tên, nhận xét và tải nhiều ảnh thực tế.

---

## 8. Giỏ Hàng & Quy Trình Thanh Toán (`CartPage.jsx`, `CheckoutPage.jsx`)
- **Giỏ hàng (`CartPage.jsx`):**
  - Danh sách sản phẩm, hình ảnh, phân loại cấu hình, giá tiền.
  - Bộ điều khiển số lượng (Tăng / Giảm) cập nhật tức thì, nút xóa sản phẩm.
  - Bảng tóm tắt: Tạm tính, phí vận chuyển (Miễn phí 0đ), tổng thanh toán và nút tiến hành đặt hàng.
  - Xử lý trạng thái giỏ hàng trống kèm nút quay lại mua sắm.
- **Thanh toán (`CheckoutPage.jsx`):**
  - Form thông tin nhận hàng: Họ tên, Số điện thoại, Địa chỉ nhận hàng chi tiết.
  - Phương thức vận chuyển: Giao hàng hỏa tốc 2H hoặc Tiêu chuẩn.
  - Phương thức thanh toán: Thanh toán khi nhận hàng (COD), Chuyển khoản ngân hàng (QR Code), Thẻ tín dụng/ghi nợ.
  - Nút Xác nhận đặt hàng kích hoạt tạo đơn hàng trên microservice.

---

## 9. Quản Lý Đơn Hàng & Đánh Giá Sau Mua (`OrderListPage.jsx`, `OrderDetailPage.jsx`, `ReviewPage.jsx`)
- **Danh sách đơn hàng (`OrderListPage.jsx`):** Lọc theo các tab trạng thái (Tất cả, Chờ xử lý, Đang giao, Đã giao, Đã hủy).
- **Chi tiết đơn hàng (`OrderDetailPage.jsx`):**
  - Mã đơn hàng, ngày đặt, danh sách sản phẩm đã mua.
  - Timeline theo dõi đơn hàng trực quan với các bước (Đã đặt -> Đã xác nhận -> Đang vận chuyển -> Giao thành công).
  - Nút dẫn tới trang viết đánh giá sản phẩm.
- **Trang Đánh giá đơn hàng (`ReviewPage.jsx`):** Giao diện gửi đánh giá độc lập cho từng đơn hàng hoàn tất.

---

## 10. Trang Hồ Sơ Người Dùng (`ProfilePage.jsx`)
- **Bố cục chuẩn mực:** Giới hạn `max-width: 1160px` căn giữa, chia 2 cột cân đối.
- **Sidebar tài khoản (290px):**
  - Thẻ tóm tắt thông tin người dùng: Avatar tròn gradient có huy hiệu tick xanh xác thực ở góc dưới bên phải (`bottom: 0; right: 0`), Họ tên, Email và chip *"Thành viên Nexora"*.
  - Menu điều hướng không bị rớt chữ: *Hồ sơ cá nhân*, *Sổ địa chỉ nhận hàng*, *Đổi mật khẩu*, *Cài đặt thông báo*, *Lịch sử đơn hàng* và nút *Đăng xuất*.
- **Thẻ nội dung chính (Main Card):**
  - **Tab Hồ sơ cá nhân:** Cập nhật Họ tên, Email, SĐT, Ngày sinh, Giới tính (Nam / Nữ / Khác).
  - **Tab Sổ địa chỉ nhận hàng:** Danh sách địa chỉ có nhãn Mặc định, nút sửa/xóa/đặt mặc định; tích hợp popup Modal thêm/sửa địa chỉ (`.modal-card`).
  - **Tab Đổi mật khẩu:** Mật khẩu cũ, mật khẩu mới, xác nhận mật khẩu, checklist hướng dẫn bảo vệ tài khoản.
  - **Tab Cài đặt thông báo:** 4 tùy chọn thông báo (Đơn hàng Email, SMS 2H, Khuyến mãi & Voucher, Cảnh báo bảo mật) điều khiển bằng **công tắc gạt Toggle Switch (iOS-style Bật/Tắt)** mượt mà.

---

## 11. Bảng Điều Khiển Quản Trị Viên (`AdminPage.jsx`)
- **Thống kê tổng quan:** Số liệu doanh thu, số đơn hàng mới, tổng khách hàng, sản phẩm đang hoạt động.
- **Quản lý sản phẩm (CRUD):** Thêm mới sản phẩm, chỉnh sửa giá/kho, tải ảnh xem trước, xóa sản phẩm, phân loại danh mục.
- **Quản lý đơn hàng:** Xem chi tiết đơn, chuyển đổi trạng thái đơn hàng (`PENDING` -> `CONFIRMED` -> `SHIPPING` -> `DELIVERED`).
- **Quản lý người dùng:** Danh sách tài khoản, thông tin liên hệ và phân quyền vai trò (`CUSTOMER` / `ADMIN`).
- **Hộp thư hỗ trợ (Support Inbox):** Tiếp nhận và phản hồi tin nhắn từ khách hàng gửi qua ChatPanel.

---

## 12. Xác Thực & Cơ Chế Giữ Giỏ Hàng (`LoginPage.jsx`, `RegisterPage.jsx`, `pendingCart.js`)
- **Giao diện Split-screen:** Nửa trái là banner công nghệ tối màu, nửa phải là form đăng nhập / đăng ký chuẩn mực.
- **Cơ chế Pending Cart:** Khách hàng chưa đăng nhập khi bấm "Mua ngay" hoặc "Thêm vào giỏ" sẽ được tự động lưu sản phẩm tạm thời, chuyển hướng sang trang đăng nhập và tự động khôi phục sản phẩm vào giỏ ngay sau khi xác thực thành công.

---

## 13. Danh Mục Các Tệp Tin Đã Được Chỉnh Sửa & Bổ Sung Mới

| Loại | Đường dẫn tệp | Nội dung xử lý chính |
|---|---|---|
| **Cấu hình** | `docker-compose.yml` | Bỏ Eureka & Admin Server, tinh gọn 5 container cốt lõi |
| **Backend** | `product-service/.../Product.java` | Chuẩn hóa ánh xạ trường dữ liệu sản phẩm |
| **Frontend HTML** | `frontend/index.html` | Bổ sung Google Font Inter và FontAwesome 6 Pro CDN |
| **CSS Toàn Cục** | `frontend/src/index.css` | 3.800+ dòng CSS tokens, layout, review, account, switch, scrollbar |
| **Routing** | `frontend/src/App.jsx` | Khai báo các route khách hàng, admin, review và modal |
| **Layout** | `frontend/src/components/Layout.jsx` | Thanh tìm kiếm 440px, fix focus outline, scroll restoration |
| **Mới** | `frontend/src/components/ChatPanel.jsx` | Trợ lý hỗ trợ khách hàng nổi góc màn hình |
| **Mới** | `frontend/src/components/ProductReviews.jsx` | Khối đánh giá sản phẩm, biểu đồ sao, lọc ảnh, modal gửi review |
| **Mới** | `frontend/src/pages/ReviewPage.jsx` | Trang đánh giá theo đơn hàng |
| **Mới** | `docs/design/ui-updates-summary.md` | Báo cáo tổng hợp toàn diện các thay đổi hệ thống |
| **Trang chủ** | `frontend/src/pages/HomePage.jsx` | BrandSlider auto-scroll, Flash Sale banner & carousel |
| **Sản phẩm** | `frontend/src/pages/ProductListPage.jsx` | Faceted counts lọc giá chính xác, fix trùng brand, bỏ icon thừa |
| **Chi tiết** | `frontend/src/pages/ProductDetailPage.jsx` | Tích hợp ProductReviews, cấu hình RAM/SSD, smooth scroll |
| **Hồ sơ** | `frontend/src/pages/ProfilePage.jsx` | User Summary Card, Toggle switch, Modal sổ địa chỉ |
| **Quản trị** | `frontend/src/pages/AdminPage.jsx` | Bảng điều khiển quản trị sản phẩm, đơn hàng, người dùng, support |
| **Giỏ hàng** | `frontend/src/pages/CartPage.jsx` | Giỏ hàng thời gian thực, điều chỉnh số lượng |
| **Thanh toán** | `frontend/src/pages/CheckoutPage.jsx` | Form đặt hàng, phương thức ship & thanh toán |
| **Đơn hàng** | `frontend/src/pages/OrderListPage.jsx` | Danh sách đơn hàng theo trạng thái |
| **Chi tiết đơn** | `frontend/src/pages/OrderDetailPage.jsx` | Timeline đơn hàng, chi tiết thanh toán |
| **Xác thực** | `frontend/src/pages/LoginPage.jsx` & `RegisterPage.jsx` | Giao diện Auth split-screen, liên kết Pending Cart |
| **Tiện ích** | `frontend/src/utils/catalog.js` | Hàm `getNormalizedPrice`, dữ liệu fallback sản phẩm công nghệ |
| **Bảo vệ** | `frontend/src/components/ProtectedRoute.jsx` | Phân quyền truy cập route khách hàng / admin |
| **Bắt lỗi** | `frontend/src/components/ErrorBoundary.jsx` | Bắt lỗi runtime, tránh vỡ trang |
