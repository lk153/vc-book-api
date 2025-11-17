# Book Order API - Enterprise Architecture

A production-ready RESTful API built with scalability and maintainability in mind.

## 🏗️ Architecture

### Layered Architecture
```
├── controllers    → Handle HTTP requests/responses
├── services       → Business logic layer
├── repositories   → Data access layer
├── routes         → API endpoint definitions
├── middleware     → Request processing
├── utils          → Helper functions
└── config         → Configuration management
```

## 📁 Project Structure

```
vc-book-api/
├── server.js                 # Application entry point
├── package.json
├── .env.example
├── .gitignore
└── src/
    ├── config/
    │   ├── config.js        # App configuration
    │   └── database.js      # Database connection
    ├── controllers/
    │   ├── book.controller.js
    │   ├── cart.controller.js
    │   ├── order.controller.js
    │   └── ...
    ├── middleware/
    │   ├── errorHandler.js
    │   ├── validators.js
    │   └── ...
    ├── repositories/
    │   ├── book.repository.js
    │   ├── cart.repository.js
    │   ├── order.repository.js
    │   └── ...
    ├── routes/
    │   ├── book.routes.js
    │   ├── cart.routes.js
    │   ├── order.routes.js
    │   ├── index.js
    │   └── ...
    ├── services/
    │   ├── book.service.js
    │   ├── cart.service.js
    │   ├── order.service.js
    │   └── ...
    ├── utils/
    │   ├── ApiError.js
    │   ├── catchAsync.js
    │   └── logger.js
    └── models/
        ├── book.model.js
        ├── cart.model.js
        ├── order.model.js
        └── ...
```

## 📚 API Documentation

### Access Swagger UI
Once the server is running, access the interactive API documentation at:
```
http://localhost:3000/api-docs
```

### Features:
- ✅ Interactive API testing
- ✅ Request/Response examples
- ✅ Schema definitions
- ✅ Try it out functionality
- ✅ Export OpenAPI spec

### Download OpenAPI Spec
```
http://localhost:3000/api-docs.json
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
# Edit .env with your MongoDB URI
```

### 3. Start Server
```bash
npm run dev
```

### 4. Access Documentation
Open browser: `http://localhost:3000/api-docs`

## 📖 API Endpoints Overview

### Books
- `GET /api/v1/books` - Get all books (with filters)
- `GET /api/v1/books/:id` - Get book details
- `POST /api/v1/books` - Create new book
- `PUT /api/v1/books/:id` - Update book
- `DELETE /api/v1/books/:id` - Delete book

### Cart
- `GET /api/v1/cart/:userId` - Get cart
- `POST /api/v1/cart/add` - Add to cart
- `PUT /api/v1/cart/update` - Update cart
- `DELETE /api/v1/cart/:userId/items/:bookId` - Remove