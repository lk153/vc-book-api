import Joi from 'joi';

// Admin login schema
export const adminLoginSchema = Joi.object({
  username: Joi.string()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.empty': 'Username is required',
      'string.min': 'Username must be at least 3 characters',
      'string.max': 'Username cannot exceed 30 characters'
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 6 characters'
    })
});

// Update order status schema
export const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')
    .required()
    .messages({
      'any.only': 'Status must be one of: pending, processing, shipped, delivered, cancelled, refunded',
      'string.empty': 'Status is required'
    })
});

// Toggle user ban schema
export const toggleUserBanSchema = Joi.object({
  banned: Joi.boolean()
    .required()
    .messages({
      'boolean.base': 'Banned must be a boolean value',
      'any.required': 'Banned field is required'
    })
});

// Admin list query schema
export const adminListQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().max(100).allow(''),
  status: Joi.string().valid('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')
});

// MongoDB ObjectId param schema
export const objectIdParamSchema = Joi.object({
  orderId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
    'string.pattern.base': 'Invalid order ID format'
  }),
  userId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
    'string.pattern.base': 'Invalid user ID format'
  }),
  bookId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
    'string.pattern.base': 'Invalid book ID format'
  })
}).unknown(true);

export default {
  adminLoginSchema,
  updateOrderStatusSchema,
  toggleUserBanSchema,
  adminListQuerySchema,
  objectIdParamSchema
};
