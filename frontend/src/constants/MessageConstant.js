import { ErrorConstant } from "./ErrorConstant";

/**
 * Thông báo hiển thị cho người dùng (tiếng Việt).
 */
export const MessageConstant = Object.freeze({
  ERROR_OCCURRED: "Có lỗi xảy ra.",
  NETWORK_ERROR: "Không kết nối được máy chủ. Vui lòng thử lại.",
  UNKNOWN_ERROR: "Đã xảy ra lỗi không xác định. Vui lòng thử lại.",
  GENERIC: "Không thể hoàn tất thao tác. Vui lòng thử lại.",

  UNAUTHORIZED: "Bạn cần đăng nhập để tiếp tục.",
  FORBIDDEN: "Bạn không có quyền thực hiện thao tác này.",
  INVALID_CREDENTIALS: "Email hoặc mật khẩu không đúng.",
  EMAIL_ALREADY_EXISTS: "Email này đã được đăng ký. Vui lòng đăng nhập hoặc dùng email khác.",
  INVALID_RESET_TOKEN: "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.",
  USER_NOT_FOUND: "Không tìm thấy người dùng.",
  VALIDATION_FAILED: "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.",
  INTERNAL_ERROR: "Hệ thống đang gặp sự cố. Vui lòng thử lại sau.",

  PRODUCT_NOT_FOUND: "Không tìm thấy sản phẩm.",
  CART_EMPTY: "Giỏ hàng trống. Hãy thêm sản phẩm trước khi thanh toán.",
  INSUFFICIENT_STOCK: "Không đủ tồn kho cho sản phẩm đã chọn.",
  ORDER_NOT_FOUND: "Không tìm thấy đơn hàng.",
  ORDER_NOT_CANCELLABLE: "Đơn hàng này không thể hủy.",
  PAYMENT_SERVICE_ERROR: "Không kết nối được dịch vụ thanh toán. Vui lòng thử lại.",

  PASSWORD_MIN_LENGTH: "Mật khẩu tối thiểu 8 ký tự.",
  PASSWORD_MISMATCH: "Mật khẩu xác nhận không khớp.",
  RESET_TOKEN_MISSING: "Thiếu token đặt lại mật khẩu. Mở lại liên kết trong email.",

  BY_CODE: Object.freeze({
    [ErrorConstant.UNAUTHORIZED]: "Bạn cần đăng nhập để tiếp tục.",
    [ErrorConstant.FORBIDDEN]: "Bạn không có quyền thực hiện thao tác này.",
    [ErrorConstant.INVALID_CREDENTIALS]: "Email hoặc mật khẩu không đúng.",
    [ErrorConstant.EMAIL_ALREADY_EXISTS]:
      "Email này đã được đăng ký. Vui lòng đăng nhập hoặc dùng email khác.",
    [ErrorConstant.INVALID_RESET_TOKEN]: "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.",
    [ErrorConstant.USER_NOT_FOUND]: "Không tìm thấy người dùng.",
    [ErrorConstant.VALIDATION_ERROR]: "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.",
    [ErrorConstant.INTERNAL_ERROR]: "Hệ thống đang gặp sự cố. Vui lòng thử lại sau.",
    [ErrorConstant.CATEGORY_EXISTS]: "Danh mục đã tồn tại.",
    [ErrorConstant.CATEGORY_NOT_FOUND]: "Không tìm thấy danh mục.",
    [ErrorConstant.PRODUCT_NOT_FOUND]: "Không tìm thấy sản phẩm.",
    [ErrorConstant.PRODUCT_SERVICE_ERROR]: "Không kiểm tra được sản phẩm. Vui lòng thử lại.",
    [ErrorConstant.CART_EMPTY]: "Giỏ hàng trống. Hãy thêm sản phẩm trước khi thanh toán.",
    [ErrorConstant.CART_ITEM_NOT_FOUND]: "Không tìm thấy sản phẩm trong giỏ hàng.",
    [ErrorConstant.ORDER_NOT_FOUND]: "Không tìm thấy đơn hàng.",
    [ErrorConstant.ORDER_NOT_CANCELLABLE]: "Đơn hàng này không thể hủy.",
    [ErrorConstant.PAYMENT_NOT_FOUND]: "Không tìm thấy giao dịch thanh toán.",
    [ErrorConstant.PAYMENT_SERVICE_ERROR]: "Không kết nối được dịch vụ thanh toán. Vui lòng thử lại.",
    [ErrorConstant.INSUFFICIENT_STOCK]: "Không đủ tồn kho cho sản phẩm đã chọn.",
    [ErrorConstant.INVALID_STOCK]: "Số lượng tồn kho không hợp lệ.",
    [ErrorConstant.INVENTORY_NOT_FOUND]: "Không tìm thấy thông tin tồn kho của sản phẩm."
  })
});

/** Ưu tiên message thân thiện theo code; không trả mã lỗi thô cho UI. */
export function resolveUserMessage({ code, message } = {}) {
  if (code && MessageConstant.BY_CODE[code]) {
    return MessageConstant.BY_CODE[code];
  }
  if (message && !/^[A-Z][A-Z0-9_]+$/.test(String(message).trim())) {
    return message;
  }
  return MessageConstant.GENERIC;
}
