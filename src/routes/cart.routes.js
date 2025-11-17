import express from 'express';
import cartController from '../controllers/cart.controller.js';
import validators from '../middleware/validators.js';

const router = express.Router();

router.get('/:userId', cartController.getCart);
router.post('/add', validators.validateCartAdd, cartController.addToCart);
router.put('/update', validators.validateCartUpdate, cartController.updateCart);
router.delete('/:userId/items/:bookId', cartController.removeFromCart);
router.delete('/:userId', cartController.clearCart);

export default router;