package gtvt.haitv.ecommerce.common.mail;

public final class ShopApprovedEmailTemplate {

    private ShopApprovedEmailTemplate() {}

    public record Context(
            String shopName,
            Long shopId,
            String slug,
            String loginEmail,
            String tempPassword,
            String storeUrl) {}

    public static String subject(String shopName) {
        return "Nava — Cửa hàng \"" + shopName + "\" đã được duyệt";
    }

    public static String body(Context ctx) {
        String base = ctx.storeUrl() == null || ctx.storeUrl().isBlank() ? "http://localhost:5173" : ctx.storeUrl();
        return """
                Xin chào,

                Cửa hàng của bạn trên Nava đã được duyệt và có thể hoạt động.

                Thông tin gian hàng:
                - Tên: %s
                - Mã shop (shopId): %s
                - Slug hồ sơ: %s

                Thông tin đăng nhập Kênh người bán:
                - Email: %s
                - Mật khẩu tạm: %s

                Lưu ý bảo mật: Đăng nhập và đổi mật khẩu ngay lần đầu.

                Liên kết:
                - Đăng nhập: %s/login
                - Kênh người bán: %s/seller
                - Vitrine cửa hàng: %s/shops/%s

                Trân trọng,
                Nava
                """
                .formatted(
                        ctx.shopName(),
                        ctx.shopId(),
                        ctx.slug(),
                        ctx.loginEmail(),
                        ctx.tempPassword(),
                        base,
                        base,
                        base,
                        ctx.shopId());
    }
}
