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
  }
};

export default validators;