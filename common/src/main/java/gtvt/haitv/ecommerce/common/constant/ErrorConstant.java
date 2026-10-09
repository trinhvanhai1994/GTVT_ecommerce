package gtvt.haitv.ecommerce.common.constant;

/**
 * Mã lỗi hệ thống (API {@code code}, log, test).
 * Không hiển thị trực tiếp cho người dùng — dùng {@link MessageConstant}.
 */
public final class ErrorConstant {

    private ErrorConstant() {
    }

    // --- Auth / security ---
    public static final String UNAUTHORIZED = "UNAUTHORIZED";
    public static final String FORBIDDEN = "FORBIDDEN";
    public static final String INVALID_CREDENTIALS = "INVALID_CREDENTIALS";
    public static final String EMAIL_ALREADY_EXISTS = "EMAIL_ALREADY_EXISTS";
    public static final String INVALID_RESET_TOKEN = "INVALID_RESET_TOKEN";
    public static final String USER_NOT_FOUND = "USER_NOT_FOUND";

    // --- Validation / generic ---
    public static final String VALIDATION_ERROR = "VALIDATION_ERROR";
    public static final String INTERNAL_ERROR = "INTERNAL_ERROR";

    // --- Catalog ---
    public static final String CATEGORY_EXISTS = "CATEGORY_EXISTS";
    public static final String CATEGORY_NOT_FOUND = "CATEGORY_NOT_FOUND";
    public static final String PRODUCT_NOT_FOUND = "PRODUCT_NOT_FOUND";
    public static final String PRODUCT_SERVICE_ERROR = "PRODUCT_SERVICE_ERROR";

    // --- Cart / order / payment / inventory ---
    public static final String CART_EMPTY = "CART_EMPTY";
    public static final String CART_ITEM_NOT_FOUND = "CART_ITEM_NOT_FOUND";
    public static final String ORDER_NOT_FOUND = "ORDER_NOT_FOUND";
    public static final String ORDER_NOT_CANCELLABLE = "ORDER_NOT_CANCELLABLE";
    public static final String PAYMENT_NOT_FOUND = "PAYMENT_NOT_FOUND";
    public static final String PAYMENT_SERVICE_ERROR = "PAYMENT_SERVICE_ERROR";
    public static final String INSUFFICIENT_STOCK = "INSUFFICIENT_STOCK";
    public static final String INVALID_STOCK = "INVALID_STOCK";
    public static final String INVENTORY_NOT_FOUND = "INVENTORY_NOT_FOUND";
}
