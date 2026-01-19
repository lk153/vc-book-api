import ApiError from '../utils/ApiError.js';

/**
 * Generic validation middleware factory
 * @param {Joi.Schema} schema - Joi schema to validate against
 * @param {string} property - Request property to validate ('body', 'params', 'query')
 * @returns {Function} Express middleware function
 */
export const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const message = error.details
        .map(detail => detail.message)
        .join(', ');
      throw new ApiError(400, message);
    }

    // Replace with validated and sanitized values
    req[property] = value;
    next();
  };
};

/**
 * Validate request body
 */
export const validateBody = (schema) => validate(schema, 'body');

/**
 * Validate request params
 */
export const validateParams = (schema) => validate(schema, 'params');

/**
 * Validate request query
 */
export const validateQuery = (schema) => validate(schema, 'query');

export default validate;
