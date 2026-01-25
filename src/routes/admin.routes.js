import express from 'express';
import adminController from '../controllers/admin.controller.js';
import categoryController from '../controllers/category.controller.js';
import { authenticateAdmin } from '../middleware/adminAuth.js';
import { validateBody, validateParams, validateQuery } from '../middleware/validate.js';
import {
  adminLoginSchema,
  updateOrderStatusSchema,
  toggleUserBanSchema,
  adminListQuerySchema,
  objectIdParamSchema
} from '../middleware/schemas/admin.schema.js';
import {
  createCategorySchema,
  updateCategorySchema,
  categoryIdParamSchema,
  categoryListQuerySchema
} from '../middleware/schemas/category.schema.js';

const adminRoutes = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin dashboard API endpoints
 */

// ==================== Authentication ====================

/**
 * @swagger
 * /admin/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 admin:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     name:
 *                       type: string
 *       401:
 *         description: Invalid credentials
 */
adminRoutes.post('/login', validateBody(adminLoginSchema), adminController.login);

/**
 * @swagger
 * /admin/me:
 *   get:
 *     summary: Get current admin info
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin info
 *       401:
 *         description: Unauthorized
 */
adminRoutes.get('/me', authenticateAdmin, adminController.getMe);

/**
 * @swagger
 * /admin/logout:
 *   post:
 *     summary: Admin logout
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
adminRoutes.post('/logout', authenticateAdmin, adminController.logout);

// ==================== Dashboard ====================

/**
 * @swagger
 * /admin/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalOrders:
 *                   type: integer
 *                 totalUsers:
 *                   type: integer
 *                 totalBooks:
 *                   type: integer
 *                 totalRevenue:
 *                   type: number
 */
adminRoutes.get('/dashboard/stats', authenticateAdmin, adminController.getDashboardStats);

// ==================== Orders ====================

/**
 * @swagger
 * /admin/orders:
 *   get:
 *     summary: Get all orders (admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, shipped, delivered, cancelled]
 *     responses:
 *       200:
 *         description: List of orders
 */
adminRoutes.get('/orders', authenticateAdmin, validateQuery(adminListQuerySchema), adminController.getAllOrders);

/**
 * @swagger
 * /admin/orders/{orderId}:
 *   get:
 *     summary: Get order details
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details
 *       404:
 *         description: Order not found
 */
adminRoutes.get('/orders/:orderId', authenticateAdmin, validateParams(objectIdParamSchema), adminController.getOrderById);

/**
 * @swagger
 * /admin/orders/{orderId}/status:
 *   put:
 *     summary: Update order status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, processing, shipped, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Order status updated
 *       404:
 *         description: Order not found
 */
adminRoutes.put(
  '/orders/:orderId/status',
  authenticateAdmin,
  validateParams(objectIdParamSchema),
  validateBody(updateOrderStatusSchema),
  adminController.updateOrderStatus
);

// ==================== Users ====================

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users (admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of users
 */
adminRoutes.get('/users', authenticateAdmin, validateQuery(adminListQuerySchema), adminController.getAllUsers);

/**
 * @swagger
 * /admin/users/{userId}:
 *   get:
 *     summary: Get user details
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: User not found
 */
adminRoutes.get('/users/:userId', authenticateAdmin, validateParams(objectIdParamSchema), adminController.getUserById);

/**
 * @swagger
 * /admin/users/{userId}/ban:
 *   put:
 *     summary: Toggle user ban status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - banned
 *             properties:
 *               banned:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User ban status updated
 *       404:
 *         description: User not found
 */
adminRoutes.put(
  '/users/:userId/ban',
  authenticateAdmin,
  validateParams(objectIdParamSchema),
  validateBody(toggleUserBanSchema),
  adminController.toggleUserBan
);

/**
 * @swagger
 * /admin/users/{userId}/reset-password:
 *   post:
 *     summary: Send password reset email to user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Password reset email sent
 *       404:
 *         description: User not found
 */
adminRoutes.post(
  '/users/:userId/reset-password',
  authenticateAdmin,
  validateParams(objectIdParamSchema),
  adminController.resetUserPassword
);

// ==================== Books ====================

/**
 * @swagger
 * /admin/books:
 *   get:
 *     summary: Get all books (admin view)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of books
 */
adminRoutes.get('/books', authenticateAdmin, validateQuery(adminListQuerySchema), adminController.getAllBooks);

// ==================== Categories ====================

/**
 * @swagger
 * /admin/categories:
 *   get:
 *     summary: Get all categories (admin view)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of categories with metadata
 */
adminRoutes.get('/categories', authenticateAdmin, validateQuery(categoryListQuerySchema), categoryController.getAllCategoriesAdmin);

/**
 * @swagger
 * /admin/categories/{categoryId}:
 *   get:
 *     summary: Get category details (admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category details with metadata
 *       404:
 *         description: Category not found
 */
adminRoutes.get('/categories/:categoryId', authenticateAdmin, validateParams(categoryIdParamSchema), categoryController.getCategoryByIdAdmin);

/**
 * @swagger
 * /admin/categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Category name already exists
 */
adminRoutes.post('/categories', authenticateAdmin, validateBody(createCategorySchema), categoryController.createCategory);

/**
 * @swagger
 * /admin/categories/{categoryId}:
 *   put:
 *     summary: Update a category
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       404:
 *         description: Category not found
 *       409:
 *         description: Category name already exists
 */
adminRoutes.put(
  '/categories/:categoryId',
  authenticateAdmin,
  validateParams(categoryIdParamSchema),
  validateBody(updateCategorySchema),
  categoryController.updateCategory
);

/**
 * @swagger
 * /admin/categories/{categoryId}:
 *   delete:
 *     summary: Delete a category
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       404:
 *         description: Category not found
 */
adminRoutes.delete(
  '/categories/:categoryId',
  authenticateAdmin,
  validateParams(categoryIdParamSchema),
  categoryController.deleteCategory
);

export default adminRoutes;
