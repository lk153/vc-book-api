import Cart from '../models/Cart.model.js';

const cartRepository = {
  async findByUserId(userId) {
    return await findOne({ userId }).populate('items.book', 'title author price stock');
  },
  
  async create(userId) {
    const cart = new Cart({ userId, items: [] });
    return await cart.save();
  },
  
  async addItem(userId, bookId, quantity, price) {
    let cart = await findOne({ userId });
    
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }
    
    await cart.addItem(bookId, quantity, price);
    return await cart.populate('items.book', 'title author price stock');
  },
  
  async updateItemQuantity(userId, bookId, quantity) {
    const cart = await findOne({ userId });
    if (!cart) return null;
    
    await cart.updateItemQuantity(bookId, quantity);
    return await cart.populate('items.book', 'title author price stock');
  },
  
  async removeItem(userId, bookId) {
    const cart = await findOne({ userId });
    if (!cart) return null;
    
    await cart.removeItem(bookId);
    return await cart.populate('items.book', 'title author price stock');
  },
  
  async delete(userId) {
    const cart = await findOne({ userId });
    if (cart) {
      await cart.clearCart();
    }
    return true;
  }
};

export default cartRepository;