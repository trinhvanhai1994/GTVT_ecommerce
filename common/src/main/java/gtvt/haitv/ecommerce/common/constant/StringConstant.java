package gtvt.haitv.ecommerce.common.constant;

/**
 * Chuỗi kỹ thuật / định dạng dùng chung (không phải message người dùng).
 */
public final class StringConstant {

    private StringConstant() {
    }

    public static final String EMPTY = "";
    public static final String SPACE = " ";
    public static final String COMMA = ",";
    public static final String SLASH = "/";
    public static final String BEARER_PREFIX = "Bearer ";
    public static final String ROLE_PREFIX = "ROLE_";
    public static final String CONTENT_TYPE_JSON = "application/json";
    public static final String HEADER_AUTHORIZATION = "Authorization";
    public static final String DEFAULT_STORE_URL = "http://localhost:5173";
    public static final String MOCK_EMAIL_LOG_PREFIX = "[MOCK EMAIL]";
    public static final String EMAIL_LOG_PREFIX = "[EMAIL]";
}
