import bookRepository from '../repositories/book.repository.js';
import ApiError from '../utils/ApiError.js';

const bookService = {
  async getAllBooks(filters) {
    const { page, limit, ...queryFilters } = filters;
    
    let books = await bookRepository.findAll(queryFilters);
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedBooks = books.slice(startIndex, endIndex);
    
    return {
      books: paginatedBooks,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(books.length / limit),
        totalItems: books.length,
        itemsPerPage: limit
      }
    };
  },
  
  async getBookById(id) {
    const book = await bookRepository.findById(id);
    if (!book) {
      throw new ApiError(404, 'Sách không được tìm thấy');
    }
    return book;
  },
  
  async createBook(bookData) {
    return await bookRepository.create(bookData);
  },
  
  async updateBook(id, bookData) {
    const book = await bookRepository.update(id, bookData);
    if (!book) {
      throw new ApiError(404, 'Sách không được tìm thấy');
    }
    return book;
  },
  
  async deleteBook(id) {
    const deleted = await bookRepository.delete(id);
    if (!deleted) {
      throw new ApiError(404, 'Sách không được tìm thấy');
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
      throw new ApiError(400, `Số lượng trong kho không đủ cho ${book.title}`);
    }
    book.stock -= quantity;
    await bookRepository.update(bookId, book);
  }
};

export default bookService;