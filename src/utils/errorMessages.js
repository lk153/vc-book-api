/**
 * Centralized error messages in Vietnamese
 * User-facing messages only - technical/log messages remain in English
 */

const ERROR_MESSAGES = {
  // Auth errors
  AUTH: {
    EMAIL_ALREADY_EXISTS: 'Email đã được đăng ký',
    EMAIL_EXISTS: (email) => `Email ${email} đã tồn tại`,
    INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng',
    ACCOUNT_DISABLED: 'Tài khoản đã bị vô hiệu hóa',
    ACCOUNT_BANNED: 'Tài khoản của bạn đã bị cấm',
    USER_NOT_FOUND: 'Người dùng không được tìm thấy',
    WRONG_PASSWORD: 'Mật khẩu hiện tại không đúng',
    INVALID_TOKEN: 'Token không hợp lệ hoặc đã hết hạn',
    INVALID_RESET_TOKEN: 'Token đặt lại không hợp lệ',
    RESET_TOKEN_EXPIRED: 'Token đặt lại không hợp lệ hoặc đã hết hạn',
    UNAUTHORIZED: 'Không có quyền truy cập',
  },

  // Admin errors
  ADMIN: {
    INVALID_CREDENTIALS: 'Thông tin đăng nhập không hợp lệ',
    UNAUTHORIZED: 'Không có quyền truy cập',
    FAILED_SEND_EMAIL: 'Không thể gửi email đặt lại mật khẩu',
  },

  // Order errors
  ORDER: {
    CART_EMPTY: 'Giỏ hàng trống',
    INSUFFICIENT_STOCK: (title) => `Không đủ số lượng trong kho: ${title}`,
    NOT_FOUND: 'Đơn hàng không tìm thấy',
    INVALID_STATUS: 'Trạng thái đơn hàng không hợp lệ',
    ONLY_PENDING_CAN_CANCEL: 'Chỉ có thể hủy đơn hàng đang chờ xử lý',
  },

  // Cart errors
  CART: {
    NOT_FOUND: 'Giỏ hàng không được tìm thấy',
    ITEM_NOT_FOUND: 'Sản phẩm không có trong giỏ hàng',
    INSUFFICIENT_STOCK: (stock) => `Chỉ ${stock} sản phẩm có sẵn trong kho`,
  },

  // Book errors
  BOOK: {
    NOT_FOUND: 'Sách không được tìm thấy',
    INSUFFICIENT_STOCK: (title) => `Số lượng trong kho không đủ cho ${title}`,
  },

  // Category errors
  CATEGORY: {
    NOT_FOUND: 'Danh mục không được tìm thấy',
    NAME_EXISTS: 'Danh mục với tên này đã tồn tại',
    DELETE_FAILED: 'Không thể xóa danh mục',
  },

  // User errors
  USER: {
    NOT_FOUND: 'Người dùng không được tìm thấy',
  },
};

export default ERROR_MESSAGES;
