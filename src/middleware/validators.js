import ApiError from '../utils/ApiError.js';

const validators = {
  validateId: (req, res, next) => {
    const id = Number.parseInt(req.params.id);
    if (Number.isNaN(id) || id <= 0) {
      throw new ApiError(400, 'ID không hợp lệ');
    }
    next();
  },

  validateBook: (req, res, next) => {
    const { title, author, price, stock } = req.body;

    if (!title || !author) {
      throw new ApiError(400, 'Tiêu đề và tác giả là bắt buộc');
    }

    if (price !== undefined && (Number.isNaN(price) || price < 0)) {
      throw new ApiError(400, 'Giá phải là một số dương');
    }

    if (stock !== undefined && (Number.isNaN(stock) || stock < 0)) {
      throw new ApiError(400, 'Số lượng tồn kho phải là một số dương');
    }

    next();
  },

  validateCartAdd: (req, res, next) => {
    const { userId, bookId, quantity } = req.body;

    if (!userId || !bookId || !quantity) {
      throw new ApiError(400, 'userId, bookId và số lượng là bắt buộc');
    }

    if (quantity <= 0) {
      throw new ApiError(400, 'Số lượng phải lớn hơn 0');
    }

    next();
  },

  validateCartUpdate: (req, res, next) => {
    const { userId, bookId, quantity } = req.body;

    if (!userId || !bookId || quantity === undefined) {
      throw new ApiError(400, 'userId, bookId, and quantity are required');
    }

    if (quantity < 0) {
      throw new ApiError(400, 'Số lượng phải lớn hơn hoặc bằng 0');
    }

    next();
  },

  validateOrder: (req, res, next) => {
    const { userId, shippingAddress } = req.body;

    if (!userId || !shippingAddress) {
      throw new ApiError(400, 'userId và địa chỉ giao hàng là bắt buộc');
    }

    const required = ['fullName', 'address', 'city', 'postalCode', 'phone'];
    for (const field of required) {
      if (!shippingAddress[field]) {
        throw new ApiError(400, `${field} là bắt buộc trong địa chỉ giao hàng`);
      }
    }

    next();
  },

  // NEW AUTH VALIDATORS
  validateRegister: (req, res, next) => {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      throw new ApiError(400, 'Tên, email, điện thoại và mật khẩu là bắt buộc');
    }

    if (name.length < 2) {
      throw new ApiError(400, 'Tên phải có ít nhất 2 ký tự');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ApiError(400, 'Vui lòng cung cấp email hợp lệ');
    }

    if (password.length < 6) {
      throw new ApiError(400, 'Mật khẩu phải có ít nhất 6 ký tự');
    }

    next();
  },

  validateLogin: (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, 'Email và mật khẩu là bắt buộc');
    }

    next();
  },

  validateUpdateProfile: (req, res, next) => {
    const { name, phone } = req.body;

    if (!name && !phone) {
      throw new ApiError(400, 'Ít nhất một trường (tên hoặc điện thoại) là bắt buộc');
    }

    if (name && name.length < 2) {
      throw new ApiError(400, 'Tên phải có ít nhất 2 ký tự');
    }

    next();
  },

  validateChangePassword: (req, res, next) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new ApiError(400, 'Mật khẩu hiện tại và mật khẩu mới là bắt buộc');
    }

    if (newPassword.length < 6) {
      throw new ApiError(400, 'Mật khẩu mới phải có ít nhất 6 ký tự');
    }

    if (currentPassword === newPassword) {
      throw new ApiError(400, 'Mật khẩu mới phải khác mật khẩu hiện tại');
    }

    next();
  }
  ,

  validateForgotPassword: (req, res, next) => {
    const { email } = req.body;

    if (!email) {
      throw new ApiError(400, 'Email is required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ApiError(400, 'Vui lòng cung cấp email hợp lệ');
    }

    next();
  },

  validateVerifyResetToken: (req, res, next) => {
    const { token } = req.body;

    if (!token) {
      throw new ApiError(400, 'Token là bắt buộc');
    }

    next();
  },

  validateResetPassword: (req, res, next) => {
    const { token, password } = req.body;

    if (!token || !password) {
      throw new ApiError(400, 'Token và mật khẩu là bắt buộc');
    }

    if (password.length < 6) {
      throw new ApiError(400, 'Mật khẩu phải có ít nhất 6 ký tự');
    }

    next();
  }
};

export default validators;
export const {
  validateId,
  validateBook,
  validateCartAdd,
  validateCartUpdate,
  validateOrder,
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword,
  validateForgotPassword,
  validateVerifyResetToken,
  validateResetPassword
} = validators;