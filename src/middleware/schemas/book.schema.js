import Joi from 'joi';

export const createBookSchema = Joi.object({
  title: Joi.string()
    .max(200)
    .required()
    .messages({
      'string.max': 'Tiêu đề không được vượt quá 200 ký tự',
      'any.required': 'Tiêu đề là bắt buộc'
    }),
  author: Joi.string()
    .max(100)
    .required()
    .messages({
      'string.max': 'Tên tác giả không được vượt quá 100 ký tự',
      'any.required': 'Tác giả là bắt buộc'
    }),
  description: Joi.string()
    .max(2000)
    .messages({
      'string.max': 'Mô tả không được vượt quá 2000 ký tự'
    }),
  price: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.min': 'Giá phải là một số dương',
      'any.required': 'Giá là bắt buộc'
    }),
  stock: Joi.number()
    .integer()
    .min(0)
    .default(0)
    .messages({
      'number.min': 'Số lượng tồn kho phải là một số dương',
      'number.integer': 'Số lượng tồn kho phải là số nguyên'
    }),
  category: Joi.string()
    .max(100)
    .allow(null, '')
    .messages({
      'string.max': 'Danh mục không được vượt quá 100 ký tự'
    }),
  image: Joi.string()
    .messages({
      'any.required': 'Hình ảnh là bắt buộc'
    }),
  coverImage: Joi.string()
    .messages({
      'any.required': 'Hình ảnh là bắt buộc'
    }),
  isbn: Joi.string().allow(''),
  publisher: Joi.string().allow(''),
  pages: Joi.number().integer().min(0),
  ratings: Joi.object({
    average: Joi.number().min(0).max(5),
    count: Joi.number().integer().min(0)
  })
}).or('image', 'coverImage').messages({
  'object.missing': 'Hình ảnh là bắt buộc'
});

export const updateBookSchema = Joi.object({
  title: Joi.string()
    .max(200)
    .messages({
      'string.max': 'Tiêu đề không được vượt quá 200 ký tự'
    }),
  author: Joi.string()
    .max(100)
    .messages({
      'string.max': 'Tên tác giả không được vượt quá 100 ký tự'
    }),
  description: Joi.string()
    .max(2000)
    .messages({
      'string.max': 'Mô tả không được vượt quá 2000 ký tự'
    }),
  price: Joi.number()
    .min(0)
    .messages({
      'number.min': 'Giá phải là một số dương'
    }),
  stock: Joi.number()
    .integer()
    .min(0)
    .messages({
      'number.min': 'Số lượng tồn kho phải là một số dương',
      'number.integer': 'Số lượng tồn kho phải là số nguyên'
    }),
  category: Joi.string()
    .max(100)
    .allow(null, '')
    .messages({
      'string.max': 'Danh mục không được vượt quá 100 ký tự'
    }),
  image: Joi.string(),
  coverImage: Joi.string(),
  isbn: Joi.string().allow(''),
  publisher: Joi.string().allow(''),
  pages: Joi.number().integer().min(0),
  ratings: Joi.object({
    average: Joi.number().min(0).max(5),
    count: Joi.number().integer().min(0)
  }),
  isActive: Joi.boolean()
}).min(1).messages({
  'object.min': 'Ít nhất một trường là bắt buộc'
});

export const bookIdParamSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'ID không hợp lệ',
      'any.required': 'ID là bắt buộc'
    })
});
