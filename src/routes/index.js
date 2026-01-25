import express from 'express';

const router = express.Router();

import bookRoutes from './book.routes.js';
import cartRoutes from './cart.routes.js';
import orderRoutes from './order.routes.js';
import authRoutes from './auth.routes.js';
import adminRoutes from './admin.routes.js';
import categoryRoutes from './category.routes.js';

router.use('/books', bookRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/categories', categoryRoutes);

export default router;