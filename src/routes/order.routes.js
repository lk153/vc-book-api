import express from 'express';
import validators from '../middleware/validators.js';
import orderController from '../controllers/order.controller.js';

const router = express.Router();

router.post('/place', validators.validateOrder, orderController.placeOrder);
router.get('/:orderId', orderController.getOrderById);
router.get('/user/:userId', orderController.getUserOrders);
router.put('/:orderId/status', orderController.updateOrderStatus);
router.delete('/:orderId', orderController.cancelOrder);

export default router;