import adminService from '../services/admin.service.js';
import bookService from '../services/book.service.js';
import catchAsync from '../utils/catchAsync.js';
import {
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
} from '../dtos/index.js';
import { toBookDTO } from '../dtos/index.js';

const adminController = {
  // Authentication
  login: catchAsync(async (req, res) => {
    const { username, password } = req.body;
    const { admin, token } = await adminService.login(username, password);

    res.json(toAdminAuthResponseDTO(admin, token));
  }),

  getMe: catchAsync(async (req, res) => {
    const admin = await adminService.getAdminById(req.admin.id);

    res.json({
      admin: toAdminDTO(admin)
    });
  }),

  logout: catchAsync(async (req, res) => {
    // JWT is stateless, logout is handled client-side
    res.json({
      message: 'Logged out successfully'
    });
  }),

  // Dashboard
  getDashboardStats: catchAsync(async (req, res) => {
    const stats = await adminService.getDashboardStats();

    res.json(toDashboardStatsDTO(stats));
  }),

  // Orders
  getAllOrders: catchAsync(async (req, res) => {
    const filters = {
      page: Number.parseInt(req.query.page) || 1,
      limit: Number.parseInt(req.query.limit) || 10,
      status: req.query.status
    };

    const result = await adminService.getAllOrders(filters);

    res.json({
      orders: toAdminOrderListDTO(result.orders),
      pagination: result.pagination
    });
  }),

  getOrderById: catchAsync(async (req, res) => {
    const order = await adminService.getOrderById(req.params.orderId);

    res.json({
      order: toAdminOrderDetailDTO(order)
    });
  }),

  updateOrderStatus: catchAsync(async (req, res) => {
    const order = await adminService.updateOrderStatus(
      req.params.orderId,
      req.body.status
    );

    res.json({
      order: toOrderStatusUpdateDTO(order)
    });
  }),

  // Users
  getAllUsers: catchAsync(async (req, res) => {
    const filters = {
      page: Number.parseInt(req.query.page) || 1,
      limit: Number.parseInt(req.query.limit) || 10,
      search: req.query.search
    };

    const result = await adminService.getAllUsers(filters);

    res.json({
      users: toAdminUserListDTO(result.users),
      pagination: result.pagination
    });
  }),

  getUserById: catchAsync(async (req, res) => {
    const { user, ordersCount } = await adminService.getUserById(req.params.userId);

    res.json({
      user: toAdminUserDetailDTO(user, ordersCount)
    });
  }),

  toggleUserBan: catchAsync(async (req, res) => {
    const user = await adminService.toggleUserBan(
      req.params.userId,
      req.body.banned
    );

    res.json({
      user: toUserBanUpdateDTO(user)
    });
  }),

  resetUserPassword: catchAsync(async (req, res) => {
    await adminService.resetUserPassword(req.params.userId);

    res.json({
      message: 'Password reset email sent successfully'
    });
  }),

  // Books (Admin view)
  getAllBooks: catchAsync(async (req, res) => {
    const filters = {
      page: Number.parseInt(req.query.page) || 1,
      limit: Number.parseInt(req.query.limit) || 10,
      search: req.query.search
    };

    const result = await adminService.getAllBooks(filters);

    res.json({
      books: toAdminBookListDTO(result.books),
      pagination: result.pagination
    });
  }),

  // Create, Update, Delete books use existing book routes
  // These are included here for reference but will be handled by existing routes
  createBook: catchAsync(async (req, res) => {
    const book = await bookService.createBook(req.body);

    res.status(201).json({
      book: toAdminBookDTO(book)
    });
  }),

  updateBook: catchAsync(async (req, res) => {
    const book = await bookService.updateBook(req.params.bookId, req.body);

    res.json({
      book: toAdminBookDTO(book)
    });
  }),

  deleteBook: catchAsync(async (req, res) => {
    await bookService.deleteBook(req.params.bookId);

    res.json({
      message: 'Book deleted successfully'
    });
  })
};

export default adminController;
