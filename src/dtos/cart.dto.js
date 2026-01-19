/**
 * Cart DTO - Shapes cart data for API responses
 */

import { toBookSummaryDTO } from './book.dto.js';

export const toCartItemDTO = (item) => {
  if (!item) return null;

  return {
    bookId: item.bookId || (item.book?._id || item.book),
    book: item.book ? toBookSummaryDTO(item.book) : null,
    quantity: item.quantity,
    price: item.price,
    subtotal: item.price * item.quantity
  };
};

export const toCartDTO = (cart) => {
  if (!cart) return null;

  const items = cart.items?.map(toCartItemDTO) || [];
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.subtotal, 0);

  return {
    id: cart._id || cart.id,
    userId: cart.userId,
    items,
    totalItems,
    totalPrice,
    lastModified: cart.lastModified,
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt
  };
};

export default {
  toCartDTO,
  toCartItemDTO
};
