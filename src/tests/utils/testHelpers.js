/**
 * Test utility functions and helpers
 */

/**
 * Create a mock Express request object
 */
export const mockRequest = (options = {}) => ({
  body: options.body || {},
  params: options.params || {},
  query: options.query || {},
  headers: options.headers || {},
  user: options.user || null,
  id: options.id || 'test-request-id',
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
});

/**
 * Create a mock Express response object
 */
export const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.header = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  return res;
};

/**
 * Create a mock next function
 */
export const mockNext = () => jest.fn();

/**
 * Sample test data factories
 */
export const createTestUser = (overrides = {}) => ({
  _id: 'user123',
  name: 'Test User',
  email: 'test@example.com',
  phone: '+1234567890',
  role: 'customer',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

export const createTestBook = (overrides = {}) => ({
  _id: 'book123',
  title: 'Test Book',
  author: 'Test Author',
  description: 'A test book description',
  price: 19.99,
  stock: 100,
  category: 'Tiểu đệ tử',
  image: 'https://example.com/book.jpg',
  ratings: { average: 4.5, count: 10 },
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

export const createTestCart = (overrides = {}) => ({
  _id: 'cart123',
  userId: 'user123',
  items: [],
  lastModified: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

export const createTestOrder = (overrides = {}) => ({
  _id: 'order123',
  orderNumber: 'ORD-20240101-0001',
  userId: 'user123',
  items: [{
    book: 'book123',
    title: 'Test Book',
    author: 'Test Author',
    price: 19.99,
    quantity: 2,
    subtotal: 39.98
  }],
  shippingAddress: {
    fullName: 'Test User',
    address: '123 Test St',
    city: 'Test City',
    postalCode: '12345',
    country: 'USA',
    phone: '+1234567890'
  },
  paymentMethod: 'Cash on Delivery',
  summary: {
    subtotal: 39.98,
    shippingFee: 5.99,
    tax: 3.20,
    total: 49.17
  },
  status: 'pending',
  statusHistory: [{ status: 'pending', timestamp: new Date() }],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});
