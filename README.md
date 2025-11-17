# Book Order API - Enterprise Architecture

A production-ready RESTful API built with scalability and maintainability in mind.

## 🏗️ Architecture

### Layered Architecture
```
├── Controllers    → Handle HTTP requests/responses
├── Services       → Business logic layer
├── Repositories   → Data access layer
├── Routes         → API endpoint definitions
├── Middleware     → Request processing
├── Utils          → Helper functions
└── Config         → Configuration management
```

## 📁 Project Structure

```
book-order-api/
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