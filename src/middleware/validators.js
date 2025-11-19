import ApiError from '../utils/ApiError.js';

const validators = {
  validateId: (req, res, next) => {
    const id = Number.parseInt(req.params.id);
    if (Number.isNaN(id) || id <= 0) {
      throw new ApiError(400, 'Invalid ID');
    }
    next();
  },

  validateBook: (req, res, next) => {
    const { title, author, price, stock } = req.body;

    if (!title || !author) {
      throw new ApiError(400, 'Title and author are required');
    }

    if (price !== undefined && (Number.isNaN(price) || price < 0)) {
      throw new ApiError(400, 'Price must be a positive number');
    }

    if (stock !== undefined && (Number.isNaN(stock) || stock < 0)) {
      throw new ApiError(400, 'Stock must be a positive number');
    }

    next();
  },

  validateCartAdd: (req, res, next) => {
    const { userId, bookId, quantity } = req.body;

    if (!userId || !bookId || !quantity) {
      throw new ApiError(400, 'userId, bookId, and quantity are required');
    }

    if (quantity <= 0) {
      throw new ApiError(400, 'Quantity must be greater than 0');
    }

    next();
  },

  validateCartUpdate: (req, res, next) => {
    const { userId, bookId, quantity } = req.body;

    if (!userId || !bookId || quantity === undefined) {
      throw new ApiError(400, 'userId, bookId, and quantity are required');
    }

    if (quantity < 0) {
      throw new ApiError(400, 'Quantity must be 0 or greater');
    }

    next();
  },

  validateOrder: (req, res, next) => {
    const { userId, shippingAddress } = req.body;

    if (!userId || !shippingAddress) {
      throw new ApiError(400, 'userId and shippingAddress are required');
    }

    const required = ['fullName', 'address', 'city', 'postalCode', 'phone'];
    for (const field of required) {
      if (!shippingAddress[field]) {
        throw new ApiError(400, `${field} is required in shipping address`);
      }
    }

    next();
  },

  // NEW AUTH VALIDATORS
  validateRegister: (req, res, next) => {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      throw new ApiError(400, 'Name, email, phone, and password are required');
    }

    if (name.length < 2) {
      throw new ApiError(400, 'Name must be at least 2 characters');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ApiError(400, 'Please provide a valid email');
    }

    if (password.length < 6) {
      throw new ApiError(400, 'Password must be at least 6 characters');
    }

    next();
  },

  validateLogin: (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required');
    }

    next();
  },

  validateUpdateProfile: (req, res, next) => {
    const { name, phone } = req.body;

    if (!name && !phone) {
      throw new ApiError(400, 'At least one field (name or phone) is required');
    }

    if (name && name.length < 2) {
      throw new ApiError(400, 'Name must be at least 2 characters');
    }

    next();
  },

  validateChangePassword: (req, res, next) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new ApiError(400, 'Old password and new password are required');
    }

    if (newPassword.length < 6) {
      throw new ApiError(400, 'New password must be at least 6 characters');
    }

    if (currentPassword === newPassword) {
      throw new ApiError(400, 'New password must be different from old password');
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
  validateChangePassword
} = validators;