import Joi from 'joi';

// Create category schema
export const createCategorySchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Category name is required',
      'string.min': 'Category name must be at least 1 character',
      'string.max': 'Category name cannot exceed 100 characters',
      'any.required': 'Category name is required'
    }),
  description: Joi.string()
    .trim()
    .max(500)
    .allow('')
    .default('')
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    })
});

// Update category schema
export const updateCategorySchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .messages({
      'string.empty': 'Category name cannot be empty',
      'string.min': 'Category name must be at least 1 character',
      'string.max': 'Category name cannot exceed 100 characters'
    }),
  description: Joi.string()
    .trim()
    .max(500)
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    })
}).min(1).messages({
  'object.min': 'At least one field is required to update'
});

// Category ID param schema
export const categoryIdParamSchema = Joi.object({
  categoryId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid category ID format',
      'any.required': 'Category ID is required'
    })
});

// Category list query schema (for admin)
export const categoryListQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().max(100).allow('')
});

export default {
  createCategorySchema,
  updateCategorySchema,
  categoryIdParamSchema,
  categoryListQuerySchema
};
