package gtvt.haitv.ecommerce.common.constant;

/**
 * Hằng số nghiệp vụ dùng chung (role, status, event…).
 */
public final class AppConstant {

    private AppConstant() {
    }

    // --- Roles ---
    public static final String ROLE_CUSTOMER = "CUSTOMER";
    /** @deprecated Prefer ROLE_PLATFORM_ADMIN; kept for JWT/DB cũ */
    public static final String ROLE_ADMIN = "ADMIN";
    public static final String ROLE_PLATFORM_ADMIN = "PLATFORM_ADMIN";
    public static final String ROLE_SELLER = "SELLER";

    // --- Shop status ---
    public static final String SHOP_PENDING = "PENDING";
    public static final String SHOP_APPROVED = "APPROVED";
    public static final String SHOP_REJECTED = "REJECTED";
    public static final String SHOP_SUSPENDED = "SUSPENDED";
    public static final String SHOP_MEMBER_OWNER = "OWNER";
    public static final String SHOP_MEMBER_ACTIVE = "ACTIVE";

    // --- User / product status ---
    public static final String STATUS_ACTIVE = "ACTIVE";
    public static final String STATUS_INACTIVE = "INACTIVE";

    // --- Order status ---
    public static final String ORDER_PENDING = "PENDING";
    public static final String ORDER_PAYMENT_PENDING = "PAYMENT_PENDING";
    public static final String ORDER_CONFIRMED = "CONFIRMED";
    public static final String ORDER_PROCESSING = "PROCESSING";
    public static final String ORDER_SHIPPING = "SHIPPING";
    public static final String ORDER_DELIVERED = "DELIVERED";
    public static final String ORDER_CANCELLED = "CANCELLED";
    public static final String ORDER_PAYMENT_FAILED = "PAYMENT_FAILED";

    // --- Notification channel / status ---
    public static final String CHANNEL_CONSOLE = "CONSOLE";
    public static final String CHANNEL_EMAIL = "EMAIL";
    public static final String NOTIFY_SENT = "SENT";
    public static final String NOTIFY_FAILED = "FAILED";
}
