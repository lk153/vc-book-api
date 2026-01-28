import bookRepository from '../repositories/book.repository.js';
import ApiError from '../utils/ApiError.js';
import ERROR_MESSAGES from '../utils/errorMessages.js';

const bookService = {
  async getAllBooks(filters) {
    const { page, limit, ...queryFilters } = filters;

    // Get paginated books and total count from database
    const [books, totalItems] = await Promise.all([
      bookRepository.findAll(queryFilters, { page, limit }),
      bookRepository.countAll(queryFilters)
    ]);

    return {
      books,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
        itemsPerPage: limit
      }
    };
  },
  
  async getBookById(id) {
    const book = await bookRepository.findById(id);
    if (!book) {
      throw new ApiError(404, ERROR_MESSAGES.BOOK.NOT_FOUND);
    }
    return book;
  },
  
  async createBook(bookData) {
    // Normalize coverImage to image
    const normalizedData = this._normalizeBookData(bookData);
    return await bookRepository.create(normalizedData);
  },

  async updateBook(id, bookData) {
    // Normalize coverImage to image
    const normalizedData = this._normalizeBookData(bookData);
    const book = await bookRepository.update(id, normalizedData);
    if (!book) {
      throw new ApiError(404, ERROR_MESSAGES.BOOK.NOT_FOUND);
    }
    return book;
  },

  _normalizeBookData(data) {
    const normalized = { ...data };
    // Map coverImage to image (admin API compatibility)
    if (normalized.coverImage && !normalized.image) {
      normalized.image = normalized.coverImage;
    }
    delete normalized.coverImage;
    return normalized;
  },
  
  async deleteBook(id) {
    const deleted = await bookRepository.delete(id);
    if (!deleted) {
      throw new ApiError(404, ERROR_MESSAGES.BOOK.NOT_FOUND);
    }
    return true;
  },
  
  async checkStock(bookId, quantity) {
    const book = await this.getBookById(bookId);
    return book.stock >= quantity;
  },
  
  async reduceStock(bookId, quantity) {
    const book = await this.getBookById(bookId);
    if (book.stock < quantity) {
      throw new ApiError(400, ERROR_MESSAGES.BOOK.INSUFFICIENT_STOCK(book.title));
    }
    book.stock -= quantity;
    await bookRepository.update(bookId, book);
  }
};

export default bookService;