import express from 'express';
import cartController from '../controllers/cart.controller.js';
import validators from '../middleware/validators.js';

const router = express.Router();

/**
 * @swagger
 * /cart/{userId}:
 *   get:
 *     summary: Get user's cart
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Cart details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Cart'
 */
router.get('/:userId', cartController.getCart);

/**
 * @swagger
 * /cart/add:
 *   post:
 *     summary: Add book to cart
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - bookId
 *               - quantity
 *             properties:
 *               userId:
 *                 type: string
 *                 example: user123
 *               bookId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 2
 *     responses:
 *       200:
 *         description: Book added to cart
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.post('/add', validators.validateCartAdd, cartController.addToCart);

/**
 * @swagger
 * /cart/update:
 *   put:
 *     summary: Update cart item quantity
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - bookId
 *               - quantity
 *             properties:
 *               userId:
 *                 type: string
 *               bookId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *                 minimum: 0
 *                 description: Set to 0 to remove item
 *     responses:
 *       200:
 *         description: Cart updated successfully
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put('/update', validators.validateCartUpdate, cartController.updateCart);

/**
 * @swagger
 * /cart/{userId}/items/{bookId}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item removed from cart
 */
router.delete('/:userId/items/:bookId', cartController.removeFromCart);

/**
 * @swagger
 * /cart/{userId}:
 *   delete:
 *     summary: Clear cart
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 */
router.delete('/:userId', cartController.clearCart);

export default router;