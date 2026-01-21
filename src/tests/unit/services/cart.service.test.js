import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import ApiError from '../../../utils/ApiError.js';
import { createTestBook, createTestCart } from '../../utils/testHelpers.js';

// Mock cart repository
const mockCartRepository = {
  findByUserId: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
};

// Mock book service
const mockBookService = {
  getBookById: jest.fn()
};

// Set up mocks before importing the service
jest.unstable_mockModule('../../../repositories/cart.repository.js', () => ({
  default: mockCartRepository
}));

jest.unstable_mockModule('../../../services/book.service.js', () => ({
  default: mockBookService
}));

// Dynamic import after mocking
const { default: cartService } = await import('../../../services/cart.service.js');

describe('CartService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCart', () => {
    it('should return cart with calculated total for existing cart', async () => {
      const userId = 'user123';
      const mockBook = createTestBook({ price: 19.99 });
      const mockCart = createTestCart({
        userId,
        items: [{
          bookId: mockBook._id,
          book: mockBook,
          quantity: 2,
          price: mockBook.price
        }]
      });

      mockCartRepository.findByUserId.mockResolvedValue(mockCart);

      const result = await cartService.getCart(userId);

      expect(mockCartRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe('39.98');
    });

    it('should return empty cart when user has no cart', async () => {
      const userId = 'user123';
      mockCartRepository.findByUserId.mockResolvedValue(null);

      const result = await cartService.getCart(userId);

      expect(result.items).toEqual([]);
      expect(result.total).toBe('0.00');
    });

    it('should return empty cart when cart has no items', async () => {
      const userId = 'user123';
      const mockCart = createTestCart({ userId, items: [] });
      mockCartRepository.findByUserId.mockResolvedValue(mockCart);

      const result = await cartService.getCart(userId);

      expect(result.items).toEqual([]);
      expect(result.total).toBe('0.00');
    });
  });

  describe('addToCart', () => {
    it('should add new item to empty cart', async () => {
      const userId = 'user123';
      const bookId = 'book123';
      const quantity = 2;
      const mockBook = createTestBook({ _id: bookId, price: 19.99, stock: 10 });
      const mockCart = createTestCart({ userId, items: [] });
      const mockUpdatedCart = createTestCart({
        userId,
        items: [{
          bookId,
          book: mockBook,
          quantity,
          price: mockBook.price
        }]
      });

      mockBookService.getBookById.mockResolvedValue(mockBook);
      mockCartRepository.findByUserId
        .mockResolvedValueOnce(mockCart)
        .mockResolvedValueOnce(mockUpdatedCart);
      mockCartRepository.update.mockResolvedValue(mockUpdatedCart);

      const result = await cartService.addToCart(userId, bookId, quantity);

      expect(mockBookService.getBookById).toHaveBeenCalledWith(bookId);
      expect(mockCartRepository.update).toHaveBeenCalledWith(userId, expect.objectContaining({
        items: expect.arrayContaining([
          expect.objectContaining({
            bookId,
            quantity,
            price: mockBook.price
          })
        ])
      }));
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe('39.98');
    });

    it('should create new cart if user has no cart', async () => {
      const userId = 'user123';
      const bookId = 'book123';
      const quantity = 1;
      const mockBook = createTestBook({ _id: bookId, price: 29.99, stock: 10 });
      const newCart = createTestCart({ userId, items: [] });
      const mockUpdatedCart = createTestCart({
        userId,
        items: [{
          bookId,
          book: mockBook,
          quantity,
          price: mockBook.price
        }]
      });

      mockBookService.getBookById.mockResolvedValue(mockBook);
      mockCartRepository.findByUserId
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockUpdatedCart);
      mockCartRepository.create.mockResolvedValue(newCart);
      mockCartRepository.update.mockResolvedValue(mockUpdatedCart);

      const result = await cartService.addToCart(userId, bookId, quantity);

      expect(mockCartRepository.create).toHaveBeenCalledWith(userId);
      expect(result.total).toBe('29.99');
    });

    it('should increase quantity when adding existing item to cart', async () => {
      const userId = 'user123';
      const bookId = 'book123';
      const existingQuantity = 2;
      const addQuantity = 3;
      const mockBook = createTestBook({ _id: bookId, price: 19.99, stock: 10 });
      const mockCart = createTestCart({
        userId,
        items: [{
          bookId,
          book: mockBook,
          quantity: existingQuantity,
          price: mockBook.price
        }]
      });
      const mockUpdatedCart = createTestCart({
        userId,
        items: [{
          bookId,
          book: mockBook,
          quantity: existingQuantity + addQuantity,
          price: mockBook.price
        }]
      });

      mockBookService.getBookById.mockResolvedValue(mockBook);
      mockCartRepository.findByUserId
        .mockResolvedValueOnce(mockCart)
        .mockResolvedValueOnce(mockUpdatedCart);
      mockCartRepository.update.mockResolvedValue(mockUpdatedCart);

      const result = await cartService.addToCart(userId, bookId, addQuantity);

      expect(result.items[0].quantity).toBe(existingQuantity + addQuantity);
      expect(result.total).toBe('99.95');
    });

    it('should throw 400 error when quantity exceeds stock', async () => {
      const userId = 'user123';
      const bookId = 'book123';
      const quantity = 15;
      const mockBook = createTestBook({ _id: bookId, price: 19.99, stock: 10 });

      mockBookService.getBookById.mockResolvedValue(mockBook);

      await expect(cartService.addToCart(userId, bookId, quantity))
        .rejects
        .toThrow(ApiError);

      await expect(cartService.addToCart(userId, bookId, quantity))
        .rejects
        .toMatchObject({ statusCode: 400 });
    });

    it('should throw error when book not found', async () => {
      const userId = 'user123';
      const bookId = 'nonexistent';
      const quantity = 1;

      mockBookService.getBookById.mockRejectedValue(
        new ApiError(404, 'Sách không được tìm thấy')
      );

      await expect(cartService.addToCart(userId, bookId, quantity))
        .rejects
        .toThrow(ApiError);
    });
  });

  describe('updateCartItem', () => {
    it('should update item quantity successfully', async () => {
      const userId = 'user123';
      const bookId = 'book123';
      const newQuantity = 5;
      const mockBook = createTestBook({ _id: bookId, price: 19.99, stock: 10 });
      const mockCart = createTestCart({
        userId,
        items: [{
          bookId,
          book: mockBook,
          quantity: 2,
          price: mockBook.price
        }]
      });
      const mockUpdatedCart = createTestCart({
        userId,
        items: [{
          bookId,
          book: mockBook,
          quantity: newQuantity,
          price: mockBook.price
        }]
      });

      mockCartRepository.findByUserId
        .mockResolvedValueOnce(mockCart)
        .mockResolvedValueOnce(mockUpdatedCart);
      mockBookService.getBookById.mockResolvedValue(mockBook);
      mockCartRepository.update.mockResolvedValue(mockUpdatedCart);

      const result = await cartService.updateCartItem(userId, bookId, newQuantity);

      expect(result.items[0].quantity).toBe(newQuantity);
      expect(result.total).toBe('99.95');
    });

    it('should remove item when quantity is 0', async () => {
      const userId = 'user123';
      const bookId = 'book123';
      const mockBook = createTestBook({ _id: bookId, price: 19.99, stock: 10 });
      const mockCart = createTestCart({
        userId,
        items: [{
          bookId,
          book: mockBook,
          quantity: 2,
          price: mockBook.price
        }]
      });
      const mockUpdatedCart = createTestCart({
        userId,
        items: []
      });

      mockCartRepository.findByUserId
        .mockResolvedValueOnce(mockCart)
        .mockResolvedValueOnce(mockUpdatedCart);
      mockCartRepository.update.mockResolvedValue(mockUpdatedCart);

      const result = await cartService.updateCartItem(userId, bookId, 0);

      expect(result.items).toHaveLength(0);
      expect(result.total).toBe('0.00');
    });

    it('should throw 404 error when cart not found', async () => {
      const userId = 'user123';
      const bookId = 'book123';

      mockCartRepository.findByUserId.mockResolvedValue(null);

      await expect(cartService.updateCartItem(userId, bookId, 5))
        .rejects
        .toThrow(ApiError);

      await expect(cartService.updateCartItem(userId, bookId, 5))
        .rejects
        .toMatchObject({ statusCode: 404 });
    });

    it('should throw 404 error when item not in cart', async () => {
      const userId = 'user123';
      const bookId = 'nonexistent';
      const mockCart = createTestCart({
        userId,
        items: [{
          bookId: 'otherbook',
          book: createTestBook({ _id: 'otherbook' }),
          quantity: 2,
          price: 19.99
        }]
      });

      mockCartRepository.findByUserId.mockResolvedValue(mockCart);

      await expect(cartService.updateCartItem(userId, bookId, 5))
        .rejects
        .toThrow(ApiError);

      await expect(cartService.updateCartItem(userId, bookId, 5))
        .rejects
        .toMatchObject({ statusCode: 404 });
    });

    it('should throw 400 error when new quantity exceeds stock', async () => {
      const userId = 'user123';
      const bookId = 'book123';
      const mockBook = createTestBook({ _id: bookId, price: 19.99, stock: 5 });
      const mockCart = createTestCart({
        userId,
        items: [{
          bookId,
          book: mockBook,
          quantity: 2,
          price: mockBook.price
        }]
      });

      mockCartRepository.findByUserId.mockResolvedValue(mockCart);
      mockBookService.getBookById.mockResolvedValue(mockBook);

      await expect(cartService.updateCartItem(userId, bookId, 10))
        .rejects
        .toThrow(ApiError);

      await expect(cartService.updateCartItem(userId, bookId, 10))
        .rejects
        .toMatchObject({ statusCode: 400 });
    });
  });

  describe('removeFromCart', () => {
    it('should remove item from cart successfully', async () => {
      const userId = 'user123';
      const bookId = 'book123';
      const mockBook = createTestBook({ _id: bookId, price: 19.99, stock: 10 });
      const mockCart = createTestCart({
        userId,
        items: [{
          bookId,
          book: mockBook,
          quantity: 2,
          price: mockBook.price
        }]
      });
      const mockUpdatedCart = createTestCart({
        userId,
        items: []
      });

      mockCartRepository.findByUserId
        .mockResolvedValueOnce(mockCart)
        .mockResolvedValueOnce(mockUpdatedCart);
      mockCartRepository.update.mockResolvedValue(mockUpdatedCart);

      const result = await cartService.removeFromCart(userId, bookId);

      expect(result.items).toHaveLength(0);
      expect(result.total).toBe('0.00');
    });

    it('should throw 404 error when cart not found', async () => {
      const userId = 'user123';
      const bookId = 'book123';

      mockCartRepository.findByUserId.mockResolvedValue(null);

      await expect(cartService.removeFromCart(userId, bookId))
        .rejects
        .toThrow(ApiError);

      await expect(cartService.removeFromCart(userId, bookId))
        .rejects
        .toMatchObject({ statusCode: 404 });
    });
  });

  describe('clearCart', () => {
    it('should clear all items from cart', async () => {
      const userId = 'user123';

      mockCartRepository.delete.mockResolvedValue(true);

      const result = await cartService.clearCart(userId);

      expect(mockCartRepository.delete).toHaveBeenCalledWith(userId);
      expect(result.items).toEqual([]);
      expect(result.total).toBe('0.00');
    });

    it('should return empty cart even if cart does not exist', async () => {
      const userId = 'user123';

      mockCartRepository.delete.mockResolvedValue(false);

      const result = await cartService.clearCart(userId);

      expect(result.items).toEqual([]);
      expect(result.total).toBe('0.00');
    });
  });

  describe('calculateCartTotal', () => {
    it('should calculate total correctly for multiple items', () => {
      const cart = {
        items: [
          { book: { price: 19.99 }, quantity: 2, price: 19.99 },
          { book: { price: 29.99 }, quantity: 1, price: 29.99 },
          { book: { price: 9.99 }, quantity: 3, price: 9.99 }
        ]
      };

      const result = cartService.calculateCartTotal(cart);

      expect(result.total).toBe('99.94');
      expect(result.items).toHaveLength(3);
    });

    it('should use item.price as fallback when book.price is not available', () => {
      const cart = {
        items: [
          { book: null, quantity: 2, price: 15.00 },
          { book: {}, quantity: 1, price: 25.00 }
        ]
      };

      const result = cartService.calculateCartTotal(cart);

      expect(result.total).toBe('55.00');
    });

    it('should return zero total for empty cart', () => {
      const cart = { items: [] };

      const result = cartService.calculateCartTotal(cart);

      expect(result.total).toBe('0.00');
      expect(result.items).toEqual([]);
    });

    it('should return zero total for null cart', () => {
      const result = cartService.calculateCartTotal(null);

      expect(result.total).toBe('0.00');
      expect(result.items).toEqual([]);
    });

    it('should return zero total for undefined cart', () => {
      const result = cartService.calculateCartTotal(undefined);

      expect(result.total).toBe('0.00');
      expect(result.items).toEqual([]);
    });

    it('should return zero total for cart with null items', () => {
      const cart = { items: null };

      const result = cartService.calculateCartTotal(cart);

      expect(result.total).toBe('0.00');
      expect(result.items).toEqual([]);
    });

    it('should handle items with zero price', () => {
      const cart = {
        items: [
          { book: { price: 0 }, quantity: 2, price: 0 },
          { book: { price: 19.99 }, quantity: 1, price: 19.99 }
        ]
      };

      const result = cartService.calculateCartTotal(cart);

      expect(result.total).toBe('19.99');
    });

    it('should handle large quantities correctly', () => {
      const cart = {
        items: [
          { book: { price: 9.99 }, quantity: 100, price: 9.99 }
        ]
      };

      const result = cartService.calculateCartTotal(cart);

      expect(result.total).toBe('999.00');
    });

    it('should handle decimal precision correctly', () => {
      const cart = {
        items: [
          { book: { price: 0.01 }, quantity: 3, price: 0.01 },
          { book: { price: 0.02 }, quantity: 2, price: 0.02 }
        ]
      };

      const result = cartService.calculateCartTotal(cart);

      expect(result.total).toBe('0.07');
    });
  });
});
