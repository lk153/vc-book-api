import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import ApiError from '../../../utils/ApiError.js';
import { createTestBook } from '../../utils/testHelpers.js';

// For ES modules, we need to use unstable_mockModule before imports
const mockBookRepository = {
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
};

jest.unstable_mockModule('../../../repositories/book.repository.js', () => ({
  default: mockBookRepository
}));

// Dynamic import after mocking
const { default: bookService } = await import('../../../services/book.service.js');

describe('BookService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllBooks', () => {
    it('should return paginated books', async () => {
      const mockBooks = [
        createTestBook({ _id: '1', title: 'Book 1' }),
        createTestBook({ _id: '2', title: 'Book 2' }),
        createTestBook({ _id: '3', title: 'Book 3' })
      ];

      mockBookRepository.findAll.mockResolvedValue(mockBooks);

      const result = await bookService.getAllBooks({ page: 1, limit: 2 });

      expect(result.books).toHaveLength(2);
      expect(result.pagination).toEqual({
        currentPage: 1,
        totalPages: 2,
        totalItems: 3,
        itemsPerPage: 2
      });
      expect(mockBookRepository.findAll).toHaveBeenCalledWith({});
    });

    it('should pass filters to repository', async () => {
      mockBookRepository.findAll.mockResolvedValue([]);

      await bookService.getAllBooks({
        page: 1,
        limit: 10,
        category: 'Tiểu đệ tử',
        search: 'test'
      });

      expect(mockBookRepository.findAll).toHaveBeenCalledWith({
        category: 'Tiểu đệ tử',
        search: 'test'
      });
    });
  });

  describe('getBookById', () => {
    it('should return book when found', async () => {
      const mockBook = createTestBook();
      mockBookRepository.findById.mockResolvedValue(mockBook);

      const result = await bookService.getBookById('book123');

      expect(result).toEqual(mockBook);
      expect(mockBookRepository.findById).toHaveBeenCalledWith('book123');
    });

    it('should throw 404 error when book not found', async () => {
      mockBookRepository.findById.mockResolvedValue(null);

      await expect(bookService.getBookById('nonexistent'))
        .rejects
        .toThrow(ApiError);

      await expect(bookService.getBookById('nonexistent'))
        .rejects
        .toMatchObject({ statusCode: 404 });
    });
  });

  describe('createBook', () => {
    it('should create and return new book', async () => {
      const bookData = {
        title: 'New Book',
        author: 'New Author',
        price: 29.99,
        stock: 50,
        category: 'Tiểu đệ tử',
        image: 'https://example.com/new.jpg'
      };
      const mockCreatedBook = createTestBook(bookData);

      mockBookRepository.create.mockResolvedValue(mockCreatedBook);

      const result = await bookService.createBook(bookData);

      expect(result).toEqual(mockCreatedBook);
      expect(mockBookRepository.create).toHaveBeenCalledWith(bookData);
    });
  });

  describe('updateBook', () => {
    it('should update and return book', async () => {
      const updateData = { title: 'Updated Title' };
      const mockUpdatedBook = createTestBook(updateData);

      mockBookRepository.update.mockResolvedValue(mockUpdatedBook);

      const result = await bookService.updateBook('book123', updateData);

      expect(result.title).toBe('Updated Title');
      expect(mockBookRepository.update).toHaveBeenCalledWith('book123', updateData);
    });

    it('should throw 404 error when book not found', async () => {
      mockBookRepository.update.mockResolvedValue(null);

      await expect(bookService.updateBook('nonexistent', { title: 'Test' }))
        .rejects
        .toThrow(ApiError);
    });
  });

  describe('deleteBook', () => {
    it('should delete book and return true', async () => {
      mockBookRepository.delete.mockResolvedValue(true);

      const result = await bookService.deleteBook('book123');

      expect(result).toBe(true);
      expect(mockBookRepository.delete).toHaveBeenCalledWith('book123');
    });

    it('should throw 404 error when book not found', async () => {
      mockBookRepository.delete.mockResolvedValue(false);

      await expect(bookService.deleteBook('nonexistent'))
        .rejects
        .toThrow(ApiError);
    });
  });

  describe('checkStock', () => {
    it('should return true when sufficient stock', async () => {
      const mockBook = createTestBook({ stock: 100 });
      mockBookRepository.findById.mockResolvedValue(mockBook);

      const result = await bookService.checkStock('book123', 50);

      expect(result).toBe(true);
    });

    it('should return false when insufficient stock', async () => {
      const mockBook = createTestBook({ stock: 10 });
      mockBookRepository.findById.mockResolvedValue(mockBook);

      const result = await bookService.checkStock('book123', 50);

      expect(result).toBe(false);
    });
  });

  describe('reduceStock', () => {
    it('should reduce stock when sufficient', async () => {
      const mockBook = createTestBook({ stock: 100 });
      mockBookRepository.findById.mockResolvedValue(mockBook);
      mockBookRepository.update.mockResolvedValue({ ...mockBook, stock: 50 });

      await bookService.reduceStock('book123', 50);

      expect(mockBookRepository.update).toHaveBeenCalledWith('book123', expect.objectContaining({
        stock: 50
      }));
    });

    it('should throw error when insufficient stock', async () => {
      const mockBook = createTestBook({ stock: 10 });
      mockBookRepository.findById.mockResolvedValue(mockBook);

      await expect(bookService.reduceStock('book123', 50))
        .rejects
        .toThrow(ApiError);
    });
  });
});
