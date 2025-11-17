import express from 'express';
const router = express.Router();

import bookRoutes from './book.routes.js';
import cartRoutes from './cart.routes.js';
import orderRoutes from './order.routes.js';

router.use('/books', bookRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);

export default router;