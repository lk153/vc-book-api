/**
 * Jest test setup file
 * Runs before all tests
 */

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';

// Suppress Winston logs during tests
process.env.LOG_LEVEL = 'error';
