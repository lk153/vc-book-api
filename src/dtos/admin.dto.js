/**
 * Admin DTOs - Shapes admin data for API responses
 */

// Admin profile DTO
export const toAdminDTO = (admin) => {
  if (!admin) return null;

  return {
    id: admin._id || admin.id,
    username: admin.username,
    name: admin.name || admin.username
  };
};

// Admin auth response DTO
export const toAdminAuthResponseDTO = (admin, token) => {
  return {
    token,
    admin: toAdminDTO(admin)
  };
};

// Dashboard stats DTO
export const toDashboardStatsDTO = (stats) => {
  return {
    totalOrders: stats.totalOrders || 0,
    totalUsers: stats.totalUsers || 0,
    totalBooks: stats.totalBooks || 0,
    totalRevenue: stats.totalRevenue || 0
  };
};

// Admin order list item DTO (includes user info)
export const toAdminOrderDTO = (order) => {
  if (!order) return null;

  return {
    id: order._id || order.id,
    orderNumber: order.orderNumber,
    user: order.userId ? {
      id: order.userId._id || order.userId,
      name: order.userId.name || null,
      email: order.userId.email || null
    } : null,
    items: order.items?.map(item => ({
      book: {
        id: item.book?._id || item.book,
        title: item.title || item.book?.title
      },
      quantity: item.quantity,
      price: item.price
    })) || [],
    totalAmount: order.summary?.total || 0,
    status: order.status?.toLowerCase(),
    shippingAddress: order.shippingAddress ? {
      fullName: order.shippingAddress.fullName,
      phone: order.shippingAddress.phone,
      address: order.shippingAddress.address,
      city: order.shippingAddress.city,
      district: order.shippingAddress.state,
      ward: order.shippingAddress.postalCode
    } : null,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt
  };
};

export const toAdminOrderListDTO = (orders) => {
  if (!orders || !Array.isArray(orders)) return [];
  return orders.map(toAdminOrderDTO);
};

// Admin order detail DTO (includes more book info)
export const toAdminOrderDetailDTO = (order) => {
  if (!order) return null;

  const dto = toAdminOrderDTO(order);
  if (dto && dto.items) {
    dto.items = order.items?.map(item => ({
      book: {
        id: item.book?._id || item.book,
        title: item.title || item.book?.title,
        coverImage: item.book?.image || null
      },
      quantity: item.quantity,
      price: item.price
    })) || [];
  }
  return dto;
};

// Admin user list item DTO
export const toAdminUserDTO = (user, ordersCount = 0) => {
  if (!user) return null;

  return {
    id: user._id || user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    banned: user.banned || false,
    ordersCount: ordersCount,
    createdAt: user.createdAt
  };
};

export const toAdminUserListDTO = (users) => {
  if (!users || !Array.isArray(users)) return [];
  return users.map(u => toAdminUserDTO(u.user || u, u.ordersCount || 0));
};

// Admin user detail DTO
export const toAdminUserDetailDTO = (user, ordersCount = 0) => {
  return toAdminUserDTO(user, ordersCount);
};

// Admin book list item DTO
export const toAdminBookDTO = (book) => {
  if (!book) return null;

  return {
    id: book._id || book.id,
    title: book.title,
    author: book.author,
    price: book.price,
    stock: book.stock,
    coverImage: book.image,
    category: book.category,
    isbn: book.isbn || null,
    publisher: book.publisher || null,
    pages: book.pages || null,
    description: book.description,
    createdAt: book.createdAt,
    updatedAt: book.updatedAt
  };
};

export const toAdminBookListDTO = (books) => {
  if (!books || !Array.isArray(books)) return [];
  return books.map(toAdminBookDTO);
};

// Order status update response DTO
export const toOrderStatusUpdateDTO = (order) => {
  if (!order) return null;

  return {
    id: order._id || order.id,
    status: order.status?.toLowerCase(),
    updatedAt: order.updatedAt
  };
};

// User ban update response DTO
export const toUserBanUpdateDTO = (user) => {
  if (!user) return null;

  return {
    id: user._id || user.id,
    banned: user.banned || false,
    updatedAt: user.updatedAt
  };
};

export default {
  toAdminDTO,
  toAdminAuthResponseDTO,
  toDashboardStatsDTO,
  toAdminOrderDTO,
  toAdminOrderListDTO,
  toAdminOrderDetailDTO,
  toAdminUserDTO,
  toAdminUserListDTO,
  toAdminUserDetailDTO,
  toAdminBookDTO,
  toAdminBookListDTO,
  toOrderStatusUpdateDTO,
  toUserBanUpdateDTO
};
