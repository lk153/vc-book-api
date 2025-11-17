import Book from '../models/Book.model.js';

const bookRepository = {
  async findAll(filters = {}) {
    const query = { isActive: true };
    
    // Category filter
    if (filters.category) {
      query.category = filters.category;
    }
    
    // Price range filter
    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice) query.price.$gte = Number.parseFloat(filters.minPrice);
      if (filters.maxPrice) query.price.$lte = Number.parseFloat(filters.maxPrice);
    }
    
    // Text search
    if (filters.search) {
      query.$text = { $search: filters.search };
    }
    
    return await Book.find(query).sort({ createdAt: -1 });
  },
  
  async findById(id) {
    return await Book.findById(id);
  },
  
  async create(bookData) {
    const book = new Book(bookData);
    return await book.save();
  },
  
  async update(id, bookData) {
    return await Book.findByIdAndUpdate(
      id,
      { $set: bookData },
      { new: true, runValidators: true }
    );
  },
  
  async delete(id) {
    // Soft delete
    const result = await Book.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    return !!result;
  },
  
  async reduceStock(id, quantity) {
    const book = await Book.findById(id);
    if (!book) throw new Error('Book not found');
    
    await book.reduceStock(quantity);
    return book;
  },
  
  async increaseStock(id, quantity) {
    const book = await Book.findById(id);
    if (!book) throw new Error('Book not found');
    
    await book.increaseStock(quantity);
    return book;
  },
  
  async findLowStock(threshold = 10) {
    return await Book.findLowStock(threshold);
  }
};

export default bookRepository;