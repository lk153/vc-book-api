import express from 'express';
import bookController from '../controllers/book.controller.js';
import validators from '../middleware/validators.js';

const bookRoutes = express.Router();
bookRoutes.get('/', bookController.getAllBooks);
bookRoutes.get('/:id', validators.validateId, bookController.getBookById);
bookRoutes.post('/', validators.validateBook, bookController.createBook);
bookRoutes.put('/:id', validators.validateId, validators.validateBook, bookController.updateBook);
bookRoutes.delete('/:id', validators.validateId, bookController.deleteBook);

export default bookRoutes;