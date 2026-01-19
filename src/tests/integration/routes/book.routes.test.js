import { jest, describe, it, expect, beforeAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { createTestBook } from '../../utils/testHelpers.js';

// Mock the service
const mockBookService = {
  getAllBooks: jest.fn(),
  getBookById: jest.fn(),
  createBook: jest.fn(),
  updateBook: jest.fn(),
  deleteBook: jest.fn()
};

jest.unstable_mockModule('../../../services/book.service.js', () => ({
  default: mockBookService
}));

// Dynamic imports after mocking
const { default: bookController } = await import('../../../controllers/book.controller.js');
const { validateBook, validateId } = await import('../../../middleware/validators.js');
const { errorHandler } = await import('../../../middleware/errorHandler.js');

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());

  // Add request ID for logging
  app.use((req, res, next) => {
    req.id = 'test-request-id';
    req.logger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn()
    };
    next();
  });

  // Book routes
  app.get('/books', bookController.getAllBooks);
  app.get('/books/:id', validateId, bookController.getBookById);
  app.post('/books', validateBook, bookController.createBook);
  app.put('/books/:id', validateId, bookController.updateBook);
  app.delete('/books/:id', validateId, bookController.deleteBook);

  // Error handler
  app.use(errorHandler);

  return app;
};

describe('Book Routes Integration Tests', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /books', () => {
    it('should return list of books with pagination', async () => {
      const mockBooks = [
        createTestBook({ _id: '1' }),
        createTestBook({ _id: '2' })
      ];

      mockBookService.getAllBooks.mockResolvedValue({
        books: mockBooks,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 2,
          itemsPerPage: 10
        }
      });

      const response = await request(app)
        .get('/books')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination).toBeDefined();
    });

    it('should pass query parameters as filters', async () => {
      mockBookService.getAllBooks.mockResolvedValue({
        books: [],
        pagination: { currentPage: 1, totalPages: 0, totalItems: 0, itemsPerPage: 10 }
      });

      await request(app)
        .get('/books?category=Tiểu%20đệ%20tử&page=2&limit=5')
        .expect(200);

      expect(mockBookService.getAllBooks).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'Tiểu đệ tử',
          page: 2,
          limit: 5
        })
      );
    });
  });

  describe('GET /books/:id', () => {
    it('should return book by id', async () => {
      const mockBook = createTestBook();
      mockBookService.getBookById.mockResolvedValue(mockBook);

      const response = await request(app)
        .get('/books/507f1f77bcf86cd799439011')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.title).toBe('Test Book');
    });

    it('should return 400 for invalid id format', async () => {
      const response = await request(app)
        .get('/books/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /books', () => {
    it('should create a new book', async () => {
      const newBook = {
        title: 'New Book',
        author: 'New Author',
        price: 29.99,
        stock: 100,
        category: 'Tiểu đệ tử',
        image: 'https://example.com/book.jpg'
      };

      const createdBook = createTestBook(newBook);
      mockBookService.createBook.mockResolvedValue(createdBook);

      const response = await request(app)
        .post('/books')
        .send(newBook)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('New Book');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/books')
        .send({ title: 'Only Title' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for negative price', async () => {
      const response = await request(app)
        .post('/books')
        .send({
          title: 'Test',
          author: 'Author',
          price: -10,
          category: 'Tiểu đệ tử',
          image: 'https://example.com/book.jpg'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /books/:id', () => {
    it('should update a book', async () => {
      const updatedBook = createTestBook({ title: 'Updated Title' });
      mockBookService.updateBook.mockResolvedValue(updatedBook);

      const response = await request(app)
        .put('/books/507f1f77bcf86cd799439011')
        .send({ title: 'Updated Title' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Title');
    });
  });

  describe('DELETE /books/:id', () => {
    it('should delete a book', async () => {
      mockBookService.deleteBook.mockResolvedValue(true);

      const response = await request(app)
        .delete('/books/507f1f77bcf86cd799439011')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('xóa');
    });
  });
});
