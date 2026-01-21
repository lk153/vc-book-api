import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import ApiError from '../../../utils/ApiError.js';
import { createTestBook, createTestCart, createTestOrder } from '../../utils/testHelpers.js';

// Mock order repository
const mockOrderRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findByUserId: jest.fn(),
  updateStatus: jest.fn()
};

// Mock cart service
const mockCartService = {
  getCart: jest.fn(),
  clearCart: jest.fn()
};

// Mock book service
const mockBookService = {
  checkStock: jest.fn(),
  getBookById: jest.fn(),
  reduceStock: jest.fn(),
  updateBook: jest.fn()
};

// Mock config
const mockConfig = {
  order: {
    freeShippingThreshold: 50,
    shippingFee: 5.99,
    taxRate: 0.08
  }
};

// Set up mocks before importing the service
jest.unstable_mockModule('../../../repositories/order.repository.js', () => ({
  default: mockOrderRepository
}));

jest.unstable_mockModule('../../../services/cart.service.js', () => ({
  default: mockCartService
}));

jest.unstable_mockModule('../../../services/book.service.js', () => ({
  default: mockBookService
}));

jest.unstable_mockModule('../../../config/config.js', () => ({
  default: mockConfig
}));

// Dynamic import after mocking
const { default: orderService } = await import('../../../services/order.service.js');

describe('OrderService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('placeOrder', () => {
    const mockShippingAddress = {
      fullName: 'Test User',
      address: '123 Test St',
      city: 'Test City',
      postalCode: '12345',
      country: 'USA',
      phone: '+1234567890'
    };

    it('should place order successfully with valid cart', async () => {
      const userId = 'user123';
      const bookId = 'book123';
      const mockBook = createTestBook({ _id: bookId, price: 29.99, stock: 10 });
      const mockCart = {
        items: [{
          bookId,
          book: mockBook,
          quantity: 2,
          price: 29.99,
          title: mockBook.title
        }],
        total: '59.98'
      };
      const mockCreatedOrder = createTestOrder({
        userId,
        items: mockCart.items,
        summary: {
          subtotal: '59.98',
          shippingFee: '0.00',
          tax: '4.80',
          total: '64.78'
        }
      });

      mockCartService.getCart.mockResolvedValue(mockCart);
      mockBookService.checkStock.mockResolvedValue(true);
      mockBookService.getBookById.mockResolvedValue(mockBook);
      mockOrderRepository.create.mockResolvedValue(mockCreatedOrder);
      mockBookService.reduceStock.mockResolvedValue();
      mockCartService.clearCart.mockResolvedValue();

      const result = await orderService.placeOrder({
        userId,
        shippingAddress: mockShippingAddress,
        paymentMethod: 'Credit Card'
      });

      expect(mockCartService.getCart).toHaveBeenCalledWith(userId);
      expect(mockBookService.checkStock).toHaveBeenCalledWith(bookId, 2);
      expect(mockOrderRepository.create).toHaveBeenCalled();
      expect(mockBookService.reduceStock).toHaveBeenCalledWith(bookId, 2);
      expect(mockCartService.clearCart).toHaveBeenCalledWith(userId);
      expect(result).toBeDefined();
    });

    it('should apply free shipping when subtotal exceeds threshold', async () => {
      const userId = 'user123';
      const bookId = 'book123';
      const mockBook = createTestBook({ _id: bookId, price: 60.00, stock: 10 });
      const mockCart = {
        items: [{
          bookId,
          book: mockBook,
          quantity: 1,
          price: 60.00,
          title: mockBook.title
        }],
        total: '60.00'
      };

      mockCartService.getCart.mockResolvedValue(mockCart);
      mockBookService.checkStock.mockResolvedValue(true);
      mockBookService.getBookById.mockResolvedValue(mockBook);
      mockOrderRepository.create.mockImplementation((orderData) => {
        expect(orderData.summary.shippingFee).toBe('0.00');
        return Promise.resolve(createTestOrder(orderData));
      });
      mockBookService.reduceStock.mockResolvedValue();
      mockCartService.clearCart.mockResolvedValue();

      await orderService.placeOrder({
        userId,
        shippingAddress: mockShippingAddress
      });

      expect(mockOrderRepository.create).toHaveBeenCalled();
    });

    it('should apply shipping fee when subtotal below threshold', async () => {
      const userId = 'user123';
      const bookId = 'book123';
      const mockBook = createTestBook({ _id: bookId, price: 20.00, stock: 10 });
      const mockCart = {
        items: [{
          bookId,
          book: mockBook,
          quantity: 1,
          price: 20.00,
          title: mockBook.title
        }],
        total: '20.00'
      };

      mockCartService.getCart.mockResolvedValue(mockCart);
      mockBookService.checkStock.mockResolvedValue(true);
      mockBookService.getBookById.mockResolvedValue(mockBook);
      mockOrderRepository.create.mockImplementation((orderData) => {
        expect(orderData.summary.shippingFee).toBe('5.99');
        return Promise.resolve(createTestOrder(orderData));
      });
      mockBookService.reduceStock.mockResolvedValue();
      mockCartService.clearCart.mockResolvedValue();

      await orderService.placeOrder({
        userId,
        shippingAddress: mockShippingAddress
      });

      expect(mockOrderRepository.create).toHaveBeenCalled();
    });

    it('should calculate tax correctly', async () => {
      const userId = 'user123';
      const bookId = 'book123';
      const mockBook = createTestBook({ _id: bookId, price: 100.00, stock: 10 });
      const mockCart = {
        items: [{
          bookId,
          book: mockBook,
          quantity: 1,
          price: 100.00,
          title: mockBook.title
        }],
        total: '100.00'
      };

      mockCartService.getCart.mockResolvedValue(mockCart);
      mockBookService.checkStock.mockResolvedValue(true);
      mockBookService.getBookById.mockResolvedValue(mockBook);
      mockOrderRepository.create.mockImplementation((orderData) => {
        expect(orderData.summary.tax).toBe('8.00');
        return Promise.resolve(createTestOrder(orderData));
      });
      mockBookService.reduceStock.mockResolvedValue();
      mockCartService.clearCart.mockResolvedValue();

      await orderService.placeOrder({
        userId,
        shippingAddress: mockShippingAddress
      });

      expect(mockOrderRepository.create).toHaveBeenCalled();
    });

    it('should generate order number with timestamp', async () => {
      const userId = 'user123';
      const bookId = 'book123';
      const mockBook = createTestBook({ _id: bookId, price: 29.99, stock: 10 });
      const mockCart = {
        items: [{
          bookId,
          book: mockBook,
          quantity: 1,
          price: 29.99,
          title: mockBook.title
        }],
        total: '29.99'
      };

      mockCartService.getCart.mockResolvedValue(mockCart);
      mockBookService.checkStock.mockResolvedValue(true);
      mockBookService.getBookById.mockResolvedValue(mockBook);
      mockOrderRepository.create.mockImplementation((orderData) => {
        expect(orderData.orderNumber).toMatch(/^ORD-\d+$/);
        return Promise.resolve(createTestOrder(orderData));
      });
      mockBookService.reduceStock.mockResolvedValue();
      mockCartService.clearCart.mockResolvedValue();

      await orderService.placeOrder({
        userId,
        shippingAddress: mockShippingAddress
      });
    });

    it('should use default payment method when not provided', async () => {
      const userId = 'user123';
      const bookId = 'book123';
      const mockBook = createTestBook({ _id: bookId, price: 29.99, stock: 10 });
      const mockCart = {
        items: [{
          bookId,
          book: mockBook,
          quantity: 1,
          price: 29.99,
          title: mockBook.title
        }],
        total: '29.99'
      };

      mockCartService.getCart.mockResolvedValue(mockCart);
      mockBookService.checkStock.mockResolvedValue(true);
      mockBookService.getBookById.mockResolvedValue(mockBook);
      mockOrderRepository.create.mockImplementation((orderData) => {
        expect(orderData.paymentMethod).toBe('Cash on Delivery');
        return Promise.resolve(createTestOrder(orderData));
      });
      mockBookService.reduceStock.mockResolvedValue();
      mockCartService.clearCart.mockResolvedValue();

      await orderService.placeOrder({
        userId,
        shippingAddress: mockShippingAddress
      });
    });

    it('should throw 400 error when cart is empty', async () => {
      const userId = 'user123';
      const mockCart = { items: [], total: '0.00' };

      mockCartService.getCart.mockResolvedValue(mockCart);

      await expect(orderService.placeOrder({
        userId,
        shippingAddress: mockShippingAddress
      })).rejects.toThrow(ApiError);

      await expect(orderService.placeOrder({
        userId,
        shippingAddress: mockShippingAddress
      })).rejects.toMatchObject({ statusCode: 400 });
    });

    it('should throw 400 error when cart items is null', async () => {
      const userId = 'user123';
      const mockCart = { items: null, total: '0.00' };

      mockCartService.getCart.mockResolvedValue(mockCart);

      await expect(orderService.placeOrder({
        userId,
        shippingAddress: mockShippingAddress
      })).rejects.toThrow(ApiError);
    });

    it('should throw 400 error when insufficient stock', async () => {
      const userId = 'user123';
      const bookId = 'book123';
      const mockBook = createTestBook({ _id: bookId, price: 29.99, stock: 1 });
      const mockCart = {
        items: [{
          bookId,
          book: mockBook,
          quantity: 5,
          price: 29.99,
          title: mockBook.title
        }],
        total: '149.95'
      };

      mockCartService.getCart.mockResolvedValue(mockCart);
      mockBookService.checkStock.mockResolvedValue(false);

      await expect(orderService.placeOrder({
        userId,
        shippingAddress: mockShippingAddress
      })).rejects.toThrow(ApiError);

      await expect(orderService.placeOrder({
        userId,
        shippingAddress: mockShippingAddress
      })).rejects.toMatchObject({ statusCode: 400 });
    });

    it('should handle multiple items in cart', async () => {
      const userId = 'user123';
      const book1 = createTestBook({ _id: 'book1', price: 19.99, stock: 10 });
      const book2 = createTestBook({ _id: 'book2', price: 29.99, stock: 10 });
      const mockCart = {
        items: [
          { bookId: 'book1', book: book1, quantity: 2, price: 19.99, title: book1.title },
          { bookId: 'book2', book: book2, quantity: 1, price: 29.99, title: book2.title }
        ],
        total: '69.97'
      };

      mockCartService.getCart.mockResolvedValue(mockCart);
      mockBookService.checkStock.mockResolvedValue(true);
      mockBookService.getBookById
        .mockResolvedValueOnce(book1)
        .mockResolvedValueOnce(book2);
      mockOrderRepository.create.mockResolvedValue(createTestOrder());
      mockBookService.reduceStock.mockResolvedValue();
      mockCartService.clearCart.mockResolvedValue();

      await orderService.placeOrder({
        userId,
        shippingAddress: mockShippingAddress
      });

      expect(mockBookService.checkStock).toHaveBeenCalledTimes(2);
      expect(mockBookService.reduceStock).toHaveBeenCalledTimes(2);
      expect(mockBookService.reduceStock).toHaveBeenCalledWith('book1', 2);
      expect(mockBookService.reduceStock).toHaveBeenCalledWith('book2', 1);
    });
  });

  describe('getOrderById', () => {
    it('should return order when found', async () => {
      const orderId = 'order123';
      const mockOrder = createTestOrder({ _id: orderId });

      mockOrderRepository.findById.mockResolvedValue(mockOrder);

      const result = await orderService.getOrderById(orderId);

      expect(mockOrderRepository.findById).toHaveBeenCalledWith(orderId);
      expect(result).toEqual(mockOrder);
    });

    it('should throw 404 error when order not found', async () => {
      const orderId = 'nonexistent';

      mockOrderRepository.findById.mockResolvedValue(null);

      await expect(orderService.getOrderById(orderId))
        .rejects
        .toThrow(ApiError);

      await expect(orderService.getOrderById(orderId))
        .rejects
        .toMatchObject({ statusCode: 404 });
    });
  });

  describe('getUserOrders', () => {
    it('should return all orders for user', async () => {
      const userId = 'user123';
      const mockOrders = [
        createTestOrder({ _id: 'order1', userId }),
        createTestOrder({ _id: 'order2', userId }),
        createTestOrder({ _id: 'order3', userId })
      ];

      mockOrderRepository.findByUserId.mockResolvedValue(mockOrders);

      const result = await orderService.getUserOrders(userId);

      expect(mockOrderRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(result).toHaveLength(3);
    });

    it('should return empty array when user has no orders', async () => {
      const userId = 'user123';

      mockOrderRepository.findByUserId.mockResolvedValue([]);

      const result = await orderService.getUserOrders(userId);

      expect(result).toEqual([]);
    });
  });

  describe('updateOrderStatus', () => {
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

    it.each(validStatuses)('should update order status to %s successfully', async (status) => {
      const orderId = 'order123';
      const mockOrder = createTestOrder({ _id: orderId, status });

      mockOrderRepository.updateStatus.mockResolvedValue(mockOrder);

      const result = await orderService.updateOrderStatus(orderId, status);

      expect(mockOrderRepository.updateStatus).toHaveBeenCalledWith(orderId, status);
      expect(result.status).toBe(status);
    });

    it('should throw 400 error for invalid status', async () => {
      const orderId = 'order123';
      const invalidStatus = 'invalid_status';

      await expect(orderService.updateOrderStatus(orderId, invalidStatus))
        .rejects
        .toThrow(ApiError);

      await expect(orderService.updateOrderStatus(orderId, invalidStatus))
        .rejects
        .toMatchObject({ statusCode: 400 });

      expect(mockOrderRepository.updateStatus).not.toHaveBeenCalled();
    });

    it('should throw 404 error when order not found', async () => {
      const orderId = 'nonexistent';

      mockOrderRepository.updateStatus.mockResolvedValue(null);

      await expect(orderService.updateOrderStatus(orderId, 'processing'))
        .rejects
        .toThrow(ApiError);

      await expect(orderService.updateOrderStatus(orderId, 'processing'))
        .rejects
        .toMatchObject({ statusCode: 404 });
    });
  });

  describe('cancelOrder', () => {
    it('should cancel pending order and restore stock', async () => {
      const orderId = 'order123';
      const book1 = createTestBook({ _id: 'book1', stock: 5 });
      const book2 = createTestBook({ _id: 'book2', stock: 3 });
      const mockOrder = createTestOrder({
        _id: orderId,
        status: 'pending',
        items: [
          { bookId: 'book1', quantity: 2 },
          { bookId: 'book2', quantity: 1 }
        ]
      });

      mockOrderRepository.findById.mockResolvedValue(mockOrder);
      mockBookService.getBookById
        .mockResolvedValueOnce(book1)
        .mockResolvedValueOnce(book2);
      mockBookService.updateBook.mockResolvedValue();
      mockOrderRepository.updateStatus.mockResolvedValue({ ...mockOrder, status: 'cancelled' });

      const result = await orderService.cancelOrder(orderId);

      expect(mockBookService.getBookById).toHaveBeenCalledTimes(2);
      expect(mockBookService.updateBook).toHaveBeenCalledTimes(2);
      expect(mockBookService.updateBook).toHaveBeenCalledWith('book1', expect.objectContaining({ stock: 7 }));
      expect(mockBookService.updateBook).toHaveBeenCalledWith('book2', expect.objectContaining({ stock: 4 }));
      expect(mockOrderRepository.updateStatus).toHaveBeenCalledWith(orderId, 'cancelled');
      expect(result).toBe(true);
    });

    it('should throw 400 error when order is not pending', async () => {
      const orderId = 'order123';
      const mockOrder = createTestOrder({ _id: orderId, status: 'shipped' });

      mockOrderRepository.findById.mockResolvedValue(mockOrder);

      await expect(orderService.cancelOrder(orderId))
        .rejects
        .toThrow(ApiError);

      await expect(orderService.cancelOrder(orderId))
        .rejects
        .toMatchObject({ statusCode: 400 });
    });

    it('should throw 400 error when order is processing', async () => {
      const orderId = 'order123';
      const mockOrder = createTestOrder({ _id: orderId, status: 'processing' });

      mockOrderRepository.findById.mockResolvedValue(mockOrder);

      await expect(orderService.cancelOrder(orderId))
        .rejects
        .toThrow(ApiError);
    });

    it('should throw 400 error when order is delivered', async () => {
      const orderId = 'order123';
      const mockOrder = createTestOrder({ _id: orderId, status: 'delivered' });

      mockOrderRepository.findById.mockResolvedValue(mockOrder);

      await expect(orderService.cancelOrder(orderId))
        .rejects
        .toThrow(ApiError);
    });

    it('should throw 400 error when order is already cancelled', async () => {
      const orderId = 'order123';
      const mockOrder = createTestOrder({ _id: orderId, status: 'cancelled' });

      mockOrderRepository.findById.mockResolvedValue(mockOrder);

      await expect(orderService.cancelOrder(orderId))
        .rejects
        .toThrow(ApiError);
    });

    it('should throw 404 error when order not found', async () => {
      const orderId = 'nonexistent';

      mockOrderRepository.findById.mockResolvedValue(null);

      await expect(orderService.cancelOrder(orderId))
        .rejects
        .toThrow(ApiError);

      await expect(orderService.cancelOrder(orderId))
        .rejects
        .toMatchObject({ statusCode: 404 });
    });
  });
});
