import { validateBody, validateParams } from './validate.js';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  verifyResetTokenSchema,
  resetPasswordSchema
} from './schemas/auth.schema.js';
import {
  createBookSchema,
  updateBookSchema,
  bookIdParamSchema
} from './schemas/book.schema.js';
import {
  addToCartSchema,
  updateCartSchema,
  cartParamsSchema
} from './schemas/cart.schema.js';
import {
  createOrderSchema,
  updateOrderStatusSchema,
  orderParamsSchema
} from './schemas/order.schema.js';

// Auth validators
export const validateRegister = validateBody(registerSchema);
export const validateLogin = validateBody(loginSchema);
export const validateUpdateProfile = validateBody(updateProfileSchema);
export const validateChangePassword = validateBody(changePasswordSchema);
export const validateForgotPassword = validateBody(forgotPasswordSchema);
export const validateVerifyResetToken = validateBody(verifyResetTokenSchema);
export const validateResetPassword = validateBody(resetPasswordSchema);

// Book validators
export const validateBook = validateBody(createBookSchema);
export const validateBookUpdate = validateBody(updateBookSchema);
export const validateId = validateParams(bookIdParamSchema);

// Cart validators
export const validateCartAdd = validateBody(addToCartSchema);
export const validateCartUpdate = validateBody(updateCartSchema);
export const validateCartParams = validateParams(cartParamsSchema);

// Order validators
export const validateOrder = validateBody(createOrderSchema);
export const validateOrderStatus = validateBody(updateOrderStatusSchema);
export const validateOrderParams = validateParams(orderParamsSchema);

// Default export for backwards compatibility
const validators = {
  validateId,
  validateBook,
  validateBookUpdate,
  validateCartAdd,
  validateCartUpdate,
  validateCartParams,
  validateOrder,
  validateOrderStatus,
  validateOrderParams,
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword,
  validateForgotPassword,
  validateVerifyResetToken,
  validateResetPassword
};

export default validators;
