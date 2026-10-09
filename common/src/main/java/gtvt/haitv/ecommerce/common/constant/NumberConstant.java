package gtvt.haitv.ecommerce.common.constant;

/**
 * Số dùng chung (timeout, độ dài, giới hạn…).
 */
public final class NumberConstant {

    private NumberConstant() {
    }

    public static final int PASSWORD_MIN_LENGTH = 8;
    public static final int PASSWORD_MAX_LENGTH = 72;
    public static final int RESET_TOKEN_TTL_MINUTES = 30;
    public static final long JWT_DEFAULT_EXPIRATION_MS = 86_400_000L;
    public static final int HTTP_TIMEOUT_MS = 20_000;
    public static final int ZERO = 0;
    public static final int ONE = 1;
}
