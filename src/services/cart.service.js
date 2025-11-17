import cartRepository from '../repositories/cart.repository.js';
import bookService from'./book.service.js';
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
    const existingItem = cart.items.find(item => item.bookId === bookId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        bookId,
        quantity,
        title: book.title,
        price: book.price,
        author: book.author
      });
    }
    
    await cartRepository.update(userId, cart);
    return this.calculateCartTotal(cart);
  },
  
  async updateCartItem(userId, bookId, quantity) {
    const cart = await cartRepository.findByUserId(userId);
    
    if (!cart) {
      throw new ApiError(404, 'Cart not found');
    }
    
    const itemIndex = cart.items.findIndex(item => item.bookId === bookId);
    
    if (itemIndex === -1) {
      throw new ApiError(404, 'Item not found in cart');
    }
    
    if (quantity === 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      // Validate stock
      const book = await bookService.getBookById(bookId);
      if (quantity > book.stock) {
        throw new ApiError(400, `Only ${book.stock} items available`);
      }
      cart.items[itemIndex].quantity = quantity;
    }
    
    await cartRepository.update(userId, cart);
    return this.calculateCartTotal(cart);
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
      return sum + (item.price * item.quantity);
    }, 0);
    
    return {
      items: cart.items,
      total: total.toFixed(2)
    };
  }
};

export default cartService;