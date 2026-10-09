package gtvt.haitv.ecommerce.common.constant;

/**
 * Thông báo hiển thị cho người dùng (tiếng Việt).
 * Ghép với {@link ErrorConstant} khi ném {@code ApiException}.
 */
public final class MessageConstant {

    private MessageConstant() {
    }

    // --- Auth / security ---
    public static final String UNAUTHORIZED = "Bạn cần đăng nhập để tiếp tục.";
    public static final String FORBIDDEN = "Bạn không có quyền thực hiện thao tác này.";
    public static final String INVALID_CREDENTIALS = "Email hoặc mật khẩu không đúng.";
    public static final String EMAIL_ALREADY_EXISTS = "Email này đã được đăng ký. Vui lòng đăng nhập hoặc dùng email khác.";
    public static final String INVALID_RESET_TOKEN = "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.";
    public static final String USER_NOT_FOUND = "Không tìm thấy người dùng.";

    // --- Validation / generic ---
    public static final String VALIDATION_FAILED = "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.";
    public static final String INTERNAL_ERROR = "Hệ thống đang gặp sự cố. Vui lòng thử lại sau.";
    public static final String QUANTITY_MUST_BE_POSITIVE = "Số lượng phải lớn hơn 0.";
    public static final String INVALID_STATUS = "Trạng thái không hợp lệ.";

    // --- Catalog ---
    public static final String CATEGORY_EXISTS = "Danh mục đã tồn tại.";
    public static final String CATEGORY_NOT_FOUND = "Không tìm thấy danh mục.";
    public static final String PRODUCT_NOT_FOUND = "Không tìm thấy sản phẩm.";
    public static final String PRODUCT_SERVICE_ERROR = "Không kiểm tra được sản phẩm. Vui lòng thử lại.";

    // --- Cart / order / payment / inventory ---
    public static final String CART_EMPTY = "Giỏ hàng trống. Hãy thêm sản phẩm trước khi thanh toán.";
    public static final String CART_ITEM_NOT_FOUND = "Không tìm thấy sản phẩm trong giỏ hàng.";
    public static final String ORDER_NOT_FOUND = "Không tìm thấy đơn hàng.";
    public static final String ORDER_NOT_CANCELLABLE = "Đơn hàng này không thể hủy.";
    public static final String PAYMENT_NOT_FOUND = "Không tìm thấy giao dịch thanh toán.";
    public static final String PAYMENT_SERVICE_ERROR = "Không kết nối được dịch vụ thanh toán. Vui lòng thử lại.";
    public static final String INSUFFICIENT_STOCK = "Không đủ tồn kho cho sản phẩm đã chọn.";
    public static final String INVALID_STOCK = "Số lượng tồn kho không hợp lệ.";
    public static final String INVENTORY_NOT_FOUND = "Không tìm thấy thông tin tồn kho của sản phẩm.";

    // --- Email subjects / bodies (auth) ---
    public static final String EMAIL_WELCOME_SUBJECT = "Chào mừng đến Nava";
    public static final String EMAIL_RESET_SUBJECT = "Đặt lại mật khẩu Nava";
}
