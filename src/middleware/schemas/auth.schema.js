import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Tên phải có ít nhất 2 ký tự',
      'string.max': 'Tên không được vượt quá 50 ký tự',
      'any.required': 'Tên là bắt buộc'
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Vui lòng cung cấp email hợp lệ',
      'any.required': 'Email là bắt buộc'
    }),
  phone: Joi.string()
    .pattern(/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/)
    .required()
    .messages({
      'string.pattern.base': 'Vui lòng cung cấp số điện thoại hợp lệ',
      'any.required': 'Điện thoại là bắt buộc'
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Mật khẩu phải có ít nhất 6 ký tự',
      'any.required': 'Mật khẩu là bắt buộc'
    })
});

export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Vui lòng cung cấp email hợp lệ',
      'any.required': 'Email là bắt buộc'
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Mật khẩu là bắt buộc'
    })
});

export const updateProfileSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .messages({
      'string.min': 'Tên phải có ít nhất 2 ký tự',
      'string.max': 'Tên không được vượt quá 50 ký tự'
    }),
  phone: Joi.string()
    .pattern(/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/)
    .messages({
      'string.pattern.base': 'Vui lòng cung cấp số điện thoại hợp lệ'
    }),
  email: Joi.string()
    .email()
    .messages({
      'string.email': 'Vui lòng cung cấp email hợp lệ'
    })
}).min(1).messages({
  'object.min': 'Ít nhất một trường là bắt buộc'
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Mật khẩu hiện tại là bắt buộc'
    }),
  newPassword: Joi.string()
    .min(6)
    .required()
    .invalid(Joi.ref('currentPassword'))
    .messages({
      'string.min': 'Mật khẩu mới phải có ít nhất 6 ký tự',
      'any.required': 'Mật khẩu mới là bắt buộc',
      'any.invalid': 'Mật khẩu mới phải khác mật khẩu hiện tại'
    })
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Vui lòng cung cấp email hợp lệ',
      'any.required': 'Email là bắt buộc'
    })
});

export const verifyResetTokenSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'any.required': 'Token là bắt buộc'
    })
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'any.required': 'Token là bắt buộc'
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Mật khẩu phải có ít nhất 6 ký tự',
      'any.required': 'Mật khẩu là bắt buộc'
    })
});
