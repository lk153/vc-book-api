import Joi from 'joi';

export const addToCartSchema = Joi.object({
  userId: Joi.string()
    .required()
    .messages({
      'any.required': 'userId là bắt buộc'
    }),
  bookId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'bookId không hợp lệ',
      'any.required': 'bookId là bắt buộc'
    }),
  quantity: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      'number.min': 'Số lượng phải lớn hơn 0',
      'number.integer': 'Số lượng phải là số nguyên',
      'any.required': 'Số lượng là bắt buộc'
    })
});

export const updateCartSchema = Joi.object({
  userId: Joi.string()
    .required()
    .messages({
      'any.required': 'userId là bắt buộc'
    }),
  bookId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'bookId không hợp lệ',
      'any.required': 'bookId là bắt buộc'
    }),
  quantity: Joi.number()
    .integer()
    .min(0)
    .required()
    .messages({
      'number.min': 'Số lượng phải lớn hơn hoặc bằng 0',
      'number.integer': 'Số lượng phải là số nguyên',
      'any.required': 'Số lượng là bắt buộc'
    })
});

export const cartParamsSchema = Joi.object({
  userId: Joi.string()
    .required()
    .messages({
      'any.required': 'userId là bắt buộc'
    }),
  bookId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      'string.pattern.base': 'bookId không hợp lệ'
    })
});
