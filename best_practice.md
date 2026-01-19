# Readability-first rules & best practices for a Node.js API (serving a separate React frontend)

Below are concise, practical rules and patterns you can apply immediately.

---

## 1) Project layout (readability-first)

Keep shallow, predictable folders. Example:

```
src/
  index.js            # app bootstrap
  config/             # env, constants
  routes/             # route definitions only
  controllers/        # parse req, call services, return response
  services/           # business logic, small single-responsibility functions
  models/             # ORM schemas or data mappers
  repositories/       # DB queries, raw persistence
  middleware/         # auth, validation, error handling, logging
  dtos/               # request/response shapes, mappers
  utils/              # small pure helpers
  tests/              # unit/integration
docs/
scripts/
.env.example
package.json
README.md
```

---

## 2) Single responsibility & small functions

- Each file/function does one clear job.
- Keep controllers thin: validate/authorize → call service → send response.
- Put business rules in services; persistence in repositories/models.

---

## 3) Naming & structure conventions

- Use verbs for controllers (e.g., `UserController.getUser`), nouns for models (`User`).
- File-per-concept: `user.controller.js`, `user.service.js`, `user.routes.js`.
- Export a single default or named exports consistently.

---

## 4) Request/response shape & DTOs

- Define and use DTOs (or simple mappers) to avoid leaking internal model structure to the frontend.
- Explicitly shape responses (fields, formats) for stability and readability.

---

## 5) Routing & controllers

- Routes only wire endpoints to controllers; avoid inline logic in routes.
- Group routes by resource and load them centrally (e.g., `/api/v1/users` → `userRoutes`).

---

## 6) Error handling

- Use central error handler middleware that normalizes error responses:
  - `{ status, code, message, details? }`
- Use Error subclasses for common cases (`NotFoundError`, `ValidationError`).
- Always return consistent HTTP status codes and a simple JSON envelope.

---

## 7) Validation & parsing

- Validate and sanitize at entry (use Joi, Zod, celebrate, yup).
- Parse ints, booleans, dates explicitly rather than trusting input.

---

## 8) Async patterns & readability

- Use `async/await` everywhere; avoid callback-style code.
- Use try/catch in controllers or an async wrapper to pass errors to error middleware.

---

## 9) Configuration & environment

- Centralize config (`config/index.js`) that reads env vars with sensible defaults and validates at startup.
- Keep secrets out of the repo (`.env`, secret manager).

---

## 10) Security basics

- Enable CORS with explicit origin list for the React app.
- Use `helmet`, rate-limiting, input sanitization.
- Never send stack traces in production responses.
- Use HTTPS and secure cookies in production when applicable.

---

## 11) Authentication & authorization

- Keep auth middleware small: verify token/session → attach user to `req`.
- Keep permission checks in services or a dedicated guard middleware.

---

## 12) Logging & observability

- Use structured logs (JSON) via `winston` or `pino`.
- Log request id and correlate across logs.
- Log errors with stack + minimal context (avoid PII).

---

## 13) Tests & local development

- Unit test services/repositories; integration tests for routes.
- Keep tests deterministic and small; mock external APIs.
- Provide a `dev` npm script and seed fixtures for local development.

---

## 14) Documentation & API contract

- Maintain OpenAPI/Swagger or at least a concise API README.
- Keep request/response examples and error codes documented.

---

## 15) Formatting, linting & commits

- Enforce style with Prettier + ESLint; prefer consistent formatting over debates.
- Use Husky to run lint/tests on commit.
- Use clear commit messages and a simple branching model.

---

## 16) Dependencies & packaging

- Keep dependencies minimal and reviewed. Pin major versions where necessary.
- Separate `devDependencies` (linters, test libs).
- Run `npm audit` or Snyk periodically.

---

## 17) Performance & pagination

- Never return unbounded lists—use pagination with limit & cursor/offset.
- Avoid N+1 DB queries; use joins or batch queries.

---

## 18) API versioning & backward compatibility

- Expose version in URL (`/api/v1/...`); keep old versions until consumers migrate.
- Keep changes additive; deprecate fields before removal.

---

## 19) Error & success response pattern (example)

- Success: `{ data: <object>, meta?: { pagination } }`
- Error: `{ error: { code: 'USER_NOT_FOUND', message: 'User not found' } }`

---

## 20) Readability-specific tips

- Prefer descriptive names over clever ones.
- Add short JSDoc comments for non-obvious functions and exported interfaces.
- Keep files < ~300 lines when possible; split when they grow.
- Prefer explicit code over magic or implicit behavior.
- Favor small, well-named boolean flags and avoid long parameter lists—use objects.

---

## Optional but recommended

- Use TypeScript for clearer contracts and IDE support (helps readability long-term).
- Use dependency injection lightly for testability.

---

If you want, I can:
- Give a concrete example repo structure with sample files.
- Convert one of your current files into the readable pattern above.

Which would you like?