import cartRepository from '../repositories/cart.repository.js';
import bookService from './book.service.js';
import ApiError from '../utils/ApiError.js';

const cartService = {
  async getCart(userId) {
    const cart = await cartRepository.findByUserId(userId);
    return this.calculateCartTotal(cart);
  },
  
  async addToCart(userId, bookId, quantity) {
    // Validate book exists and has stock
    const book = await bookService.getBookById(bookId);
    
    if (quantity > book.stock) {
      throw new ApiError(400, `Only ${book.stock} items available in stock`);
    }
    
    let cart = await cartRepository.findByUserId(userId);
    
    if (!cart) {
      cart = await cartRepository.create(userId);
    }
    
    // Check if book already in cart
    const existingItemIndex = cart.items.findIndex(item => {
      const itemBookId = item.book._id || item.book;
      return itemBookId.toString() === bookId.toString();
    });
    
    if (existingItemIndex >= 0) {
      // Update existing item quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        book: bookId,  // Store only the ObjectId
        quantity,
        price: book.price
      });
    }
    
    // Prepare data for update - extract only ObjectIds
    const cartData = {
      items: cart.items.map(item => ({
        book: item.book._id || item.book,  // Extract ObjectId if populated
        quantity: item.quantity,
        price: item.price
      }))
    };
    
    // Update cart in database
    await cartRepository.update(userId, cartData);
    
    // Fetch updated cart with populated book data
    const updatedCart = await cartRepository.findByUserId(userId);
    return this.calculateCartTotal(updatedCart);
  },
  
  async updateCartItem(userId, bookId, quantity) {
    const cart = await cartRepository.findByUserId(userId);
    
    if (!cart) {
      throw new ApiError(404, 'Cart not found');
    }
    
    const itemIndex = cart.items.findIndex(item => item.book._id.toString() === bookId.toString());
    
    if (itemIndex === -1) {
      throw new ApiError(404, 'Item not found in cart');
    }
    
    if (quantity === 0) {
      // Remove item
      cart.items.splice(itemIndex, 1);
    } else {
      // Validate stock
      const book = await bookService.getBookById(bookId);
      if (quantity > book.stock) {
        throw new ApiError(400, `Only ${book.stock} items available`);
      }
      cart.items[itemIndex].quantity = quantity;
    }
    
    // Update cart in database
    await cartRepository.update(userId, cart);
    
    // Fetch updated cart with populated book data
    const updatedCart = await cartRepository.findByUserId(userId);
    return this.calculateCartTotal(updatedCart);
  },
  
  async removeFromCart(userId, bookId) {
    return this.updateCartItem(userId, bookId, 0);
  },
  
  async clearCart(userId) {
    await cartRepository.delete(userId);
    return { items: [], total: '0.00' };
  },
  
  calculateCartTotal(cart) {
    if (!cart?.items?.length) {
      return { items: [], total: '0.00' };
    }
    
    const total = cart.items.reduce((sum, item) => {
      const price = item.book?.price || item.price || 0;
      return sum + (price * item.quantity);
    }, 0);
    
    return {
      items: cart.items,
      total: total.toFixed(2)
    };
  }
};

export default cartService;