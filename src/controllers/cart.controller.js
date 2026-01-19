import cartService from '../services/cart.service.js';
import catchAsync from '../utils/catchAsync.js';
import { toCartDTO } from '../dtos/index.js';

const cartController = {
  getCart: catchAsync(async (req, res) => {
    const cart = await cartService.getCart(req.params.userId);

    res.json({
      success: true,
      data: toCartDTO(cart)
    });
  }),

  addToCart: catchAsync(async (req, res) => {
    const { userId, bookId, quantity } = req.body;
    const cart = await cartService.addToCart(userId, bookId, quantity);

    res.json({
      success: true,
      message: 'Sách đã được thêm vào giỏ hàng',
      data: toCartDTO(cart)
    });
  }),

  updateCart: catchAsync(async (req, res) => {
    const { userId, bookId, quantity } = req.body;
    const cart = await cartService.updateCartItem(userId, bookId, quantity);

    res.json({
      success: true,
      message: 'Giỏ hàng đã được cập nhật thành công',
      data: toCartDTO(cart)
    });
  }),

  removeFromCart: catchAsync(async (req, res) => {
    const { userId, bookId } = req.params;
    const cart = await cartService.removeFromCart(userId, bookId);

    res.json({
      success: true,
      message: 'Sách đã được xóa khỏi giỏ hàng',
      data: toCartDTO(cart)
    });
  }),

  clearCart: catchAsync(async (req, res) => {
    await cartService.clearCart(req.params.userId);

    res.json({
      success: true,
      message: 'Giỏ hàng đã được xóa thành công'
    });
  })
};

export default cartController;