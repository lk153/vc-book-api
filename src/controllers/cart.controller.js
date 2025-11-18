import cartService from '../services/cart.service.js';
import catchAsync from '../utils/catchAsync.js';

const cartController = {
  getCart: catchAsync(async (req, res) => {
    const cart = await cartService.getCart(req.params.userId);
    
    res.json({
      success: true,
      data: cart
    });
  }),
  
  addToCart: catchAsync(async (req, res) => {
    const { userId, bookId, quantity } = req.body;
    const cart = await cartService.addToCart(userId, bookId, quantity);
    
    res.json({
      success: true,
      message: 'Book added to cart',
      data: cart
    });
  }),
  
  updateCart: catchAsync(async (req, res) => {
    const { userId, bookId, quantity } = req.body;
    const cart = await cartService.updateCartItem(userId, bookId, quantity);
    
    res.json({
      success: true,
      message: 'Cart updated successfully',
      data: cart
    });
  }),
  
  removeFromCart: catchAsync(async (req, res) => {
    const { userId, bookId } = req.params;
    const cart = await cartService.removeFromCart(userId, bookId);
    
    res.json({
      success: true,
      message: 'Item removed from cart',
      data: cart
    });
  }),
  
  clearCart: catchAsync(async (req, res) => {
    await cartService.clearCart(req.params.userId);
    
    res.json({
      success: true,
      message: 'Cart cleared successfully'
    });
  })
};

export default cartController;