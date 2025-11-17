import bookService from '../services/book.service.js';
import catchAsync  from '../utils/catchAsync.js';

const bookController = {
  getAllBooks: catchAsync(async (req, res) => {
    const filters = {
      category: req.query.category,
      search: req.query.search,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      page: Number.parseInt(req.query.page) || 1,
      limit: Number.parseInt(req.query.limit) || 10
    };
    
    const result = await bookService.getAllBooks(filters);
    
    res.json({
      success: true,
      data: result.books,
      pagination: result.pagination
    });
  }),
  
  getBookById: catchAsync(async (req, res) => {
    const book = await bookService.getBookById(req.params.id);
    
    res.json({
      success: true,
      data: book
    });
  }),
  
  createBook: catchAsync(async (req, res) => {
    const book = await bookService.createBook(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      data: book
    });
  }),
  
  updateBook: catchAsync(async (req, res) => {
    const book = await bookService.updateBook(req.params.id, req.body);
    
    res.json({
      success: true,
      message: 'Book updated successfully',
      data: book
    });
  }),
  
  deleteBook: catchAsync(async (req, res) => {
    await bookService.deleteBook(req.params.id);
    
    res.json({
      success: true,
      message: 'Book deleted successfully'
    });
  })
};

export default bookController;
