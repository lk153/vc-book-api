/**
 * Book DTO - Shapes book data for API responses
 */

export const toBookDTO = (book) => {
  if (!book) return null;

  return {
    id: book._id || book.id,
    title: book.title,
    author: book.author,
    description: book.description,
    price: book.price,
    stock: book.stock,
    category: book.category,
    image: book.image,
    ratings: book.ratings,
    isAvailable: book.isAvailable ?? (book.stock > 0 && book.isActive),
    createdAt: book.createdAt,
    updatedAt: book.updatedAt
  };
};

export const toBookListDTO = (books) => {
  if (!books || !Array.isArray(books)) return [];
  return books.map(toBookDTO);
};

export const toBookSummaryDTO = (book) => {
  if (!book) return null;

  return {
    id: book._id || book.id,
    title: book.title,
    author: book.author,
    price: book.price,
    image: book.image
  };
};

export default {
  toBookDTO,
  toBookListDTO,
  toBookSummaryDTO
};
