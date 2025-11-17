import orderRepository from '../repositories/order.repository.js';
import cartService from './cart.service.js';
import bookService from './book.service.js';
import config from '../config/config.js';
import ApiError from '../utils/ApiError.js';

const orderService = {
  async placeOrder(orderData) {
    const { userId, shippingAddress, paymentMethod } = orderData;
    
    // Get cart
    const cart = await cartService.getCart(userId);
    
    if (!cart.items || cart.items.length === 0) {
      throw new ApiError(400, 'Cart is empty');
    }
    
    // Validate stock for all items
    for (const item of cart.items) {
      const hasStock = await bookService.checkStock(item.bookId, item.quantity);
      if (!hasStock) {
        throw new ApiError(400, `Insufficient stock for ${item.title}`);
      }
    }
    
    // Calculate totals
    const subtotal = Number.parseFloat(cart.total);
    const shippingFee = subtotal > config.order.freeShippingThreshold ? 0 : config.order.shippingFee;
    const tax = subtotal * config.order.taxRate;
    const total = subtotal + shippingFee + tax;
    
    // Create order
    const order = await orderRepository.create({
      userId,
      items: cart.items.map(item => ({
        bookId: item.bookId,
        title: item.title,
        author: item.author,
        price: item.price,
        quantity: item.quantity,
        subtotal: (item.price * item.quantity).toFixed(2)
      })),
      shippingAddress,
      paymentMethod: paymentMethod || 'Cash on Delivery',
      summary: {
        subtotal: subtotal.toFixed(2),
        shippingFee: shippingFee.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2)
      },
      status: 'Pending'
    });
    
    // Reduce stock for all items
    for (const item of cart.items) {
      await bookService.reduceStock(item.bookId, item.quantity);
    }
    
    // Clear cart
    await cartService.clearCart(userId);
    
    return order;
  },
  
  async getOrderById(orderId) {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new ApiError(404, 'Order not found');
    }
    return order;
  },
  
  async getUserOrders(userId) {
    return await orderRepository.findByUserId(userId);
  },
  
  async updateOrderStatus(orderId, status) {
    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    
    if (!validStatuses.includes(status)) {
      throw new ApiError(400, 'Invalid order status');
    }
    
    const order = await orderRepository.updateStatus(orderId, status);
    if (!order) {
      throw new ApiError(404, 'Order not found');
    }
    return order;
  },
  
  async cancelOrder(orderId) {
    const order = await this.getOrderById(orderId);
    
    if (order.status !== 'Pending') {
      throw new ApiError(400, 'Only pending orders can be cancelled');
    }
    
    // Restore stock
    for (const item of order.items) {
      const book = await bookService.getBookById(item.bookId);
      book.stock += item.quantity;
      await bookService.updateBook(item.bookId, book);
    }
    
    await orderRepository.updateStatus(orderId, 'Cancelled');
    return true;
  }
};

export default orderService;