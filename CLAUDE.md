# CLAUDE.md - VC Book API

## Project Overview

**Type:** Node.js REST API with Express.js
**Database:** MongoDB with Mongoose ODM
**Language:** JavaScript (ES Modules - `"type": "module"`)
**Purpose:** Book ordering system API serving a separate React frontend

## Quick Commands

```bash
npm run dev          # Start development server (nodemon)
npm start            # Start production server
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
npm run seed         # Seed database with sample data
```

## Architecture

### Layered Architecture Pattern

```
Request → Middleware → Controller → Service → Repository → Model → MongoDB
                                      ↓
                                    DTOs (response shaping)
```

### Folder Structure

```
src/
├── config/          # Environment config, database, swagger
├── controllers/     # HTTP request handlers (thin, delegate to services)
├── services/        # Business logic layer
├── repositories/    # Data access layer (MongoDB operations)
├── models/          # Mongoose schemas (user, book, cart, order)
├── routes/          # API endpoint definitions with Swagger docs
├── middleware/      # Auth, validation (Joi), error handling, logging
│   └── schemas/     # Joi validation schemas
├── dtos/            # Data Transfer Objects for API responses
├── utils/           # ApiError, catchAsync, logger (Winston)
├── infrastructure/  # External services (Brevo email)
├── scripts/         # Database seeding
└── tests/           # Jest unit and integration tests
    ├── unit/
    ├── integration/
    └── utils/
```

## Key Files

| File | Purpose |
|------|---------|
| `server.js` | App entry point, middleware setup |
| `src/config/config.js` | All environment configuration |
| `src/utils/ApiError.js` | Custom error class with status codes |
| `src/utils/catchAsync.js` | Async error wrapper for controllers |
| `src/utils/logger.js` | Winston structured logging |
| `src/middleware/auth.js` | JWT authentication & authorization |
| `src/middleware/validate.js` | Joi validation middleware factory |
| `src/middleware/errorHandler.js` | Global error response handler |

## API Routes

### Auth (`/api/v1/auth`)
- `POST /register` - Create account
- `POST /login` - Login, returns JWT
- `GET /profile` - Get current user (auth required)
- `PUT /profile` - Update profile (auth required)
- `POST /change-password` - Change password (auth required)
- `POST /forgot-password` - Request reset email
- `POST /reset-password` - Reset with token

### Books (`/api/v1/books`)
- `GET /` - List with filters (category, search, minPrice, maxPrice, page, limit)
- `GET /:id` - Get by ID
- `POST /` - Create book
- `PUT /:id` - Update book
- `DELETE /:id` - Soft delete

### Cart (`/api/v1/cart`)
- `GET /:userId` - Get cart
- `POST /add` - Add item
- `PUT /update` - Update quantity
- `DELETE /:userId/items/:bookId` - Remove item
- `DELETE /:userId` - Clear cart

### Orders (`/api/v1/orders`)
- `POST /place` - Create order
- `GET /:orderId` - Get order
- `GET /user/:userId` - User's orders
- `PUT /:orderId/status` - Update status
- `DELETE /:orderId` - Cancel order

### Other
- `GET /health` - Health check
- `GET /api-docs` - Swagger UI
- `GET /api-docs.json` - OpenAPI spec

## Database Models

### User
- Fields: name, email (unique), phone, password (hashed), role (customer/admin), isActive
- Methods: `comparePassword()`, `toPublicJSON()`

### Book
- Fields: title, author, description, price, stock, category, image, ratings, isActive
- Virtual: `isAvailable`
- Methods: `hasStock()`, `reduceStock()`, `increaseStock()`
- Indexes: text search (title, author, description), category+price, createdAt

### Cart
- Fields: userId (unique), items [{bookId, book (ref), quantity, price}], lastModified
- Virtuals: `totalItems`, `totalPrice`
- Methods: `addItem()`, `updateItemQuantity()`, `removeItem()`, `clearCart()`

### Order
- Fields: orderNumber (auto-generated), userId, items, shippingAddress, paymentMethod, summary (subtotal, shippingFee, tax, total), status, statusHistory
- Status enum: Pending, Processing, Shipped, Delivered, Cancelled, Refunded
- Methods: `cancel()`

## Configuration

### Environment Variables
```
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/bookstore
JWT_SECRET=your-secret-key
WEB_PATH=http://localhost:8000
BREVO_API_KEY=
BREVO_EMAIL=
```

### Order Pricing (config.js)
- Free shipping threshold: $50
- Shipping fee: $5.99
- Tax rate: 8%

## Middleware Stack

1. **Helmet** - Security headers
2. **Rate limiter** - 100 req/15min per IP
3. **Request ID** - UUID correlation ID
4. **Body parser** - JSON (10kb limit)
5. **CORS** - Allowlist origins
6. **Request logger** - Winston with timing
7. **Routes** with validators
8. **Error handler** - Consistent JSON errors

## Validation

Uses **Joi** schemas in `src/middleware/schemas/`. Validation middleware factory in `src/middleware/validate.js`:

```javascript
import { validateBody, validateParams } from './validate.js';
import { createBookSchema } from './schemas/book.schema.js';

// Usage in routes
router.post('/', validateBody(createBookSchema), controller.create);
```

## Error Handling

```javascript
// Throw ApiError in services
throw new ApiError(404, 'Sách không được tìm thấy');

// Use catchAsync wrapper in controllers
const getBook = catchAsync(async (req, res) => {
  const book = await bookService.getBookById(req.params.id);
  res.json({ success: true, data: toBookDTO(book) });
});
```

## DTOs

Transform models to API responses, excluding sensitive fields:

```javascript
import { toBookDTO, toBookListDTO } from '../dtos/index.js';

// In controller
res.json({ success: true, data: toBookDTO(book) });
```

## Testing

- **Framework:** Jest with ES modules support
- **HTTP testing:** Supertest
- **Mocking:** `jest.unstable_mockModule()` for ES modules

```javascript
// Import Jest globals for ES modules
import { jest, describe, it, expect } from '@jest/globals';

// Mock before dynamic import
jest.unstable_mockModule('../repositories/book.repository.js', () => ({
  default: mockRepository
}));
const { default: bookService } = await import('../services/book.service.js');
```

## Response Format

### Success
```json
{
  "success": true,
  "data": { ... },
  "pagination": { "currentPage": 1, "totalPages": 5, "totalItems": 50, "itemsPerPage": 10 }
}
```

### Error
```json
{
  "success": false,
  "message": "Error description",
  "stack": "..." // Development only
}
```

## Logging

Winston logger with environment-based formatting:
- **Development:** Colorized, readable format
- **Production:** JSON format, file logging (logs/error.log, logs/combined.log)

```javascript
import logger from './utils/logger.js';
logger.info('Message', { requestId: req.id, userId: user.id });
```

## Security Features

- Helmet security headers
- Rate limiting (100 req/15min)
- JWT authentication (24h expiry)
- Password hashing (bcrypt, salt 10)
- Input validation (Joi)
- CORS allowlist
- Soft deletes
- Request correlation IDs

## Common Patterns

### Adding a New Feature

1. Create model in `src/models/`
2. Create repository in `src/repositories/`
3. Create service in `src/services/`
4. Create DTO in `src/dtos/`
5. Create Joi schema in `src/middleware/schemas/`
6. Create controller in `src/controllers/`
7. Create routes in `src/routes/`
8. Add routes to `src/routes/index.js`
9. Add tests in `src/tests/`

### Controller Pattern
```javascript
const controller = {
  methodName: catchAsync(async (req, res) => {
    const result = await service.method(req.body);
    res.status(200).json({
      success: true,
      data: toDTO(result)
    });
  })
};
```

## Notes

- Vietnamese language used in error messages
- Book categories currently limited to: 'Tiểu đệ tử'
- Soft deletes via `isActive: false` flag
- Order numbers auto-generated: ORD-YYYYMMDD-XXXX
- Email service uses Brevo API
