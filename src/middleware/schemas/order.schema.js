import Joi from 'joi';

const shippingAddressSchema = Joi.object({
  fullName: Joi.string()
    .required()
    .messages({
      'any.required': 'fullName là bắt buộc trong địa chỉ giao hàng'
    }),
  address: Joi.string()
    .required()
    .messages({
      'any.required': 'address là bắt buộc trong địa chỉ giao hàng'
    }),
  city: Joi.string()
    .required()
    .messages({
      'any.required': 'city là bắt buộc trong địa chỉ giao hàng'
    }),
  state: Joi.string()
    .allow('', null),
  postalCode: Joi.string()
    .required()
    .messages({
      'any.required': 'postalCode là bắt buộc trong địa chỉ giao hàng'
    }),
  country: Joi.string()
    .default('USA'),
  phone: Joi.string()
    .required()
    .messages({
      'any.required': 'phone là bắt buộc trong địa chỉ giao hàng'
    })
});

const orderItemSchema = Joi.object({
  bookId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required(),
  quantity: Joi.number()
    .integer()
    .min(1)
    .required()
});

export const createOrderSchema = Joi.object({
  userId: Joi.string()
    .required()
    .messages({
      'any.required': 'userId là bắt buộc'
    }),
  shippingAddress: shippingAddressSchema
    .required()
    .messages({
      'any.required': 'Địa chỉ giao hàng là bắt buộc'
    }),
  paymentMethod: Joi.string()
    .valid('Credit Card', 'Debit Card', 'PayPal', 'Cash on Delivery')
    .default('Cash on Delivery'),
  items: Joi.array()
    .items(orderItemSchema)
    .min(1)
    .messages({
      'array.min': 'Đơn hàng phải có ít nhất một sản phẩm'
    }),
  totalAmount: Joi.number()
    .min(0)
});

export const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded')
    .required()
    .messages({
      'any.only': 'Trạng thái không hợp lệ',
      'any.required': 'Trạng thái là bắt buộc'
    })
});

export const orderParamsSchema = Joi.object({
  orderId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'orderId không hợp lệ',
      'any.required': 'orderId là bắt buộc'
    }),
  userId: Joi.string()
});
