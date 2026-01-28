import orderRepository from '../repositories/order.repository.js';
import userRepository from '../repositories/user.repository.js';
import cartService from './cart.service.js';
import bookService from './book.service.js';
import config from '../config/config.js';
import ApiError from '../utils/ApiError.js';
import ERROR_MESSAGES from '../utils/errorMessages.js';
import logger from '../utils/logger.js';
import { BrevoEmailService } from '../infrastructure/email/brevoEmailService.js';
import { SendOrderConfirmation } from '../infrastructure/email/sendOrderConfirmation.js';
import { SendOrderStatusNotification } from '../infrastructure/email/sendOrderStatusNotification.js';

const emailService = new BrevoEmailService();
const sendOrderConfirmation = new SendOrderConfirmation(emailService);
const sendOrderStatusNotification = new SendOrderStatusNotification(emailService);

const orderService = {
  async placeOrder(orderData) {
    const { userId, shippingAddress, paymentMethod } = orderData;
    
    // Get cart
    const cart = await cartService.getCart(userId);
    
    if (!cart.items || cart.items.length === 0) {
      throw new ApiError(400, ERROR_MESSAGES.ORDER.CART_EMPTY);
    }

    // Validate stock for all items
    for (const item of cart.items) {
      const hasStock = await bookService.checkStock(item.bookId, item.quantity);
      if (!hasStock) {
        throw new ApiError(400, ERROR_MESSAGES.ORDER.INSUFFICIENT_STOCK(item.title));
      }
    }
    
    // Calculate totals
    const subtotal = Number.parseFloat(cart.total);
    const shippingFee = subtotal > config.order.freeShippingThreshold ? 0 : config.order.shippingFee;
    const tax = subtotal * config.order.taxRate;
    const total = subtotal + shippingFee + tax;

    // Get books
    let mapBooks = {};
    for (const item of cart.items) {
      const book = await bookService.getBookById(item.bookId);
      mapBooks[item.bookId] = book;
    }
    
    // Create order
    const order = await orderRepository.create({
      userId,
      items: cart.items.map(item => ({
        bookId: item.bookId,
        book: mapBooks[item.bookId],
        title: mapBooks[item.bookId].title,
        author: mapBooks[item.bookId].author,
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
      status: 'pending',
      orderNumber: `ORD-${Date.now()}`
    });
    
    // Reduce stock for all items
    for (const item of cart.items) {
      await bookService.reduceStock(item.bookId, item.quantity);
    }

    // Clear cart
    await cartService.clearCart(userId);

    // Send order confirmation email (non-blocking, log errors)
    try {
      const user = await userRepository.findById(userId);
      if (user && user.email) {
        await sendOrderConfirmation.execute(user.email, order);
        logger.info(`Order confirmation email sent for order ${order.orderNumber}`);
      }
    } catch (emailError) {
      logger.error(`Failed to send order confirmation email for order ${order.orderNumber}: ${emailError.message}`);
    }

    return order;
  },
  
  async getOrderById(orderId) {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new ApiError(404, ERROR_MESSAGES.ORDER.NOT_FOUND);
    }
    return order;
  },
  
  async getUserOrders(userId) {
    return await orderRepository.findByUserId(userId);
  },
  
  async updateOrderStatus(orderId, status) {
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

    if (!validStatuses.includes(status)) {
      throw new ApiError(400, ERROR_MESSAGES.ORDER.INVALID_STATUS);
    }

    const order = await orderRepository.updateStatus(orderId, status);
    if (!order) {
      throw new ApiError(404, ERROR_MESSAGES.ORDER.NOT_FOUND);
    }

    // Send status notification email (non-blocking, log errors)
    // Skip 'pending' as order confirmation email handles that
    if (status !== 'pending') {
      try {
        const user = await userRepository.findById(order.userId);
        if (user && user.email) {
          await sendOrderStatusNotification.execute(user.email, order, status);
          logger.info(`Order status notification sent for order ${order.orderNumber} (status: ${status})`);
        }
      } catch (emailError) {
        logger.error(`Failed to send order status notification for order ${order.orderNumber}: ${emailError.message}`);
      }
    }

    return order;
  },
  
  async cancelOrder(orderId) {
    const order = await this.getOrderById(orderId);
    
    if (order.status !== 'pending') {
      throw new ApiError(400, ERROR_MESSAGES.ORDER.ONLY_PENDING_CAN_CANCEL);
    }
    
    // Restore stock
    for (const item of order.items) {
      const book = await bookService.getBookById(item.bookId);
      book.stock += item.quantity;
      await bookService.updateBook(item.bookId, book);
    }
    
    await orderRepository.updateStatus(orderId, 'cancelled');
    return true;
  }
};

export default orderService;