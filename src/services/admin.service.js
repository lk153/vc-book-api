import jwt from 'jsonwebtoken';
import adminRepository from '../repositories/admin.repository.js';
import userRepository from '../repositories/user.repository.js';
import bookRepository from '../repositories/book.repository.js';
import orderRepository from '../repositories/order.repository.js';
import ApiError from '../utils/ApiError.js';
import config from '../config/config.js';
import { BrevoEmailService } from '../infrastructure/email/brevoEmailService.js';
import { SendResetPassword } from '../infrastructure/email/sendResetPassword.js';
import crypto from 'crypto';

const emailService = new BrevoEmailService();
const sendResetPassword = new SendResetPassword(emailService);

const adminService = {
  // Authentication
  async login(username, password) {
    const admin = await adminRepository.findByUsername(username);

    if (!admin || !admin.isActive) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid credentials');
    }

    // Update last login
    await adminRepository.updateLastLogin(admin._id);

    // Generate token
    const token = jwt.sign(
      { id: admin._id, username: admin.username, isAdmin: true },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    return { admin, token };
  },

  async getAdminById(adminId) {
    const admin = await adminRepository.findById(adminId);
    if (!admin) {
      throw new ApiError(401, 'Unauthorized');
    }
    return admin;
  },

  // Dashboard
  async getDashboardStats() {
    // Get total orders count
    const Order = (await import('../models/order.model.js')).default;
    const totalOrders = await Order.countDocuments();

    // Get total users count (only customers, not admins)
    const User = (await import('../models/user.model.js')).default;
    const totalUsers = await User.countDocuments({ role: 'customer' });

    // Get total books count
    const Book = (await import('../models/book.model.js')).default;
    const totalBooks = await Book.countDocuments({ isActive: true });

    // Get total revenue from delivered/shipped orders
    const revenueResult = await Order.aggregate([
      {
        $match: {
          status: 'delivered'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$summary.total' }
        }
      }
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    return {
      totalOrders,
      totalUsers,
      totalBooks,
      totalRevenue
    };
  },

  // Orders
  async getAllOrders(filters) {
    const { page = 1, limit = 10, status } = filters;

    const Order = (await import('../models/order.model.js')).default;

    const query = {};
    if (status) {
      query.status = status.toLowerCase();
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('userId', 'name email')
      .populate('items.book', 'title image')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  async getOrderById(orderId) {
    const Order = (await import('../models/order.model.js')).default;

    const order = await Order.findById(orderId)
      .populate('userId', 'name email')
      .populate('items.book', 'title image');

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    return order;
  },

  async updateOrderStatus(orderId, status) {
    const Order = (await import('../models/order.model.js')).default;

    const mappedStatus = status.toLowerCase();

    const order = await Order.findById(orderId);
    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    // Add status history entry
    order.status = mappedStatus;
    order.statusHistory.push({
      status: mappedStatus,
      timestamp: new Date()
    });

    await order.save();
    return order;
  },

  // Users
  async getAllUsers(filters) {
    const { page = 1, limit = 10, search } = filters;

    const User = (await import('../models/user.model.js')).default;

    const matchQuery = { role: 'customer' };
    if (search) {
      matchQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count for pagination
    const total = await User.countDocuments(matchQuery);

    // Use aggregation with $lookup to get users and order counts in single query
    const usersWithOrderCount = await User.aggregate([
      { $match: matchQuery },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'userId',
          as: 'orders'
        }
      },
      {
        $addFields: {
          ordersCount: { $size: '$orders' }
        }
      },
      {
        $project: {
          orders: 0,
          password: 0
        }
      }
    ]);

    // Transform to match expected format { user, ordersCount }
    const users = usersWithOrderCount.map(userData => {
      const { ordersCount, ...user } = userData;
      return { user, ordersCount };
    });

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  async getUserById(userId) {
    const User = (await import('../models/user.model.js')).default;
    const Order = (await import('../models/order.model.js')).default;

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const ordersCount = await Order.countDocuments({ userId: user._id });

    return { user, ordersCount };
  },

  async toggleUserBan(userId, banned) {
    const User = (await import('../models/user.model.js')).default;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { banned: banned } },
      { new: true }
    );

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return user;
  },

  async resetUserPassword(userId) {
    const User = (await import('../models/user.model.js')).default;

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetUrl = `${config.web_path}/reset-password?token=${resetToken}`;

    // Store token with expiration (1 hour)
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.passwordResetExpires = Date.now() + 3600000; // 1 hour
    await user.save({ validateBeforeSave: false });

    // Send email
    try {
      await sendResetPassword.execute(user.email, resetUrl);
    } catch (error) {
      // Clear reset token if email fails
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      throw new ApiError(500, 'Failed to send password reset email');
    }

    return true;
  },

  // Books (Admin view - includes all books)
  async getAllBooks(filters) {
    const { page = 1, limit = 10, search } = filters;

    const Book = (await import('../models/book.model.js')).default;

    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Book.countDocuments(query);
    const books = await Book.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      books,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
};

export default adminService;
