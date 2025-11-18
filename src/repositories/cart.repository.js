import Cart from '../models/Cart.model.js';

const cartRepository = {
  async findByUserId(userId) {
    return await Cart.findOne({ userId }).populate('items.book', 'title author price stock');
  },
  
  async create(userId) {
    const cart = new Cart({ userId, items: [] });
    return await cart.save();
  },
  
  async update(userId, cartData) {
    const cart = await Cart.findOneAndUpdate(
      { userId },
      { 
        $set: {
          items: cartData.items,
          lastModified: Date.now()
        }
      },
      { 
        new: true, 
        upsert: true,
        runValidators: true 
      }
    ).populate('items.book', 'title author price stock');
    
    return cart;
  },
  
  async addItem(userId, bookId, quantity, price) {
    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }
    
    await cart.addItem(bookId, quantity, price);
    return await cart.populate('items.book', 'title author price stock');
  },
  
  async updateItemQuantity(userId, bookId, quantity) {
    const cart = await Cart.findOne({ userId });
    if (!cart) return null;
    
    await cart.updateItemQuantity(bookId, quantity);
    return await cart.populate('items.book', 'title author price stock');
  },
  
  async removeItem(userId, bookId) {
    const cart = await Cart.findOne({ userId });
    if (!cart) return null;
    
    await cart.removeItem(bookId);
    return await cart.populate('items.book', 'title author price stock');
  },
  
  async delete(userId) {
    const result = await Cart.findOneAndDelete({ userId });
    return !!result;
  },
  
  async clearCart(userId) {
    const cart = await Cart.findOne({ userId });
    if (cart) {
      await cart.clearCart();
      return cart;
    }
    return null;
  }
};

export default cartRepository;