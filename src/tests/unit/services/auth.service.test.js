import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import ApiError from '../../../utils/ApiError.js';
import { createTestUser } from '../../utils/testHelpers.js';

// Mock user repository
const mockUserRepository = {
  create: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  updatePassword: jest.fn(),
  updateLastLogin: jest.fn()
};

// Mock jwt
const mockJwt = {
  sign: jest.fn(),
  verify: jest.fn()
};

// Mock bcrypt
const mockBcrypt = {
  genSalt: jest.fn(),
  hash: jest.fn()
};

// Mock email service
const mockEmailService = {
  sendEmail: jest.fn()
};

// Mock SendResetPassword use case
const MockSendResetPassword = jest.fn().mockImplementation(() => ({
  execute: jest.fn().mockResolvedValue({ success: true })
}));

// Mock config
const mockConfig = {
  jwt: {
    secret: 'test-secret',
    expiresIn: '24h'
  },
  web_path: 'http://localhost:8000'
};

// Set up mocks before importing the service
jest.unstable_mockModule('../../../repositories/user.repository.js', () => ({
  default: mockUserRepository
}));

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: mockJwt
}));

jest.unstable_mockModule('bcryptjs', () => ({
  default: mockBcrypt
}));

jest.unstable_mockModule('../../../config/config.js', () => ({
  default: mockConfig
}));

jest.unstable_mockModule('../../../infrastructure/email/brevoEmailService.js', () => ({
  BrevoEmailService: jest.fn().mockImplementation(() => mockEmailService)
}));

jest.unstable_mockModule('../../../infrastructure/email/sendResetPassword.js', () => ({
  SendResetPassword: MockSendResetPassword
}));

// Dynamic import after mocking
const { default: authService } = await import('../../../services/auth.service.js');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateToken', () => {
    it('should generate a JWT token with user id', () => {
      const userId = 'user123';
      const expectedToken = 'generated-jwt-token';
      mockJwt.sign.mockReturnValue(expectedToken);

      const result = authService.generateToken(userId);

      expect(result).toBe(expectedToken);
      expect(mockJwt.sign).toHaveBeenCalledWith(
        { id: userId },
        mockConfig.jwt.secret,
        { expiresIn: mockConfig.jwt.expiresIn }
      );
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'New User',
        email: 'new@example.com',
        phone: '+1234567890',
        password: 'password123'
      };
      const mockUser = {
        _id: 'newuser123',
        ...userData,
        toPublicJSON: jest.fn().mockReturnValue({
          _id: 'newuser123',
          name: userData.name,
          email: userData.email,
          phone: userData.phone
        })
      };
      const expectedToken = 'new-user-token';

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(mockUser);
      mockJwt.sign.mockReturnValue(expectedToken);

      const result = await authService.register(userData);

      expect(result.token).toBe(expectedToken);
      expect(result.user.email).toBe(userData.email);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        password: userData.password
      });
    });

    it('should throw 400 error when email already exists', async () => {
      const userData = {
        name: 'New User',
        email: 'existing@example.com',
        phone: '+1234567890',
        password: 'password123'
      };
      const existingUser = createTestUser({ email: userData.email });

      mockUserRepository.findByEmail.mockResolvedValue(existingUser);

      await expect(authService.register(userData))
        .rejects
        .toThrow(ApiError);

      await expect(authService.register(userData))
        .rejects
        .toMatchObject({ statusCode: 400 });
    });
  });

  describe('login', () => {
    it('should login user successfully with valid credentials', async () => {
      const email = 'test@example.com';
      const password = 'correctpassword';
      const mockUser = {
        _id: 'user123',
        email,
        isActive: true,
        banned: false,
        comparePassword: jest.fn().mockResolvedValue(true),
        toPublicJSON: jest.fn().mockReturnValue({
          _id: 'user123',
          email,
          name: 'Test User'
        })
      };
      const expectedToken = 'login-token';

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockUserRepository.updateLastLogin.mockResolvedValue(mockUser);
      mockJwt.sign.mockReturnValue(expectedToken);

      const result = await authService.login(email, password);

      expect(result.token).toBe(expectedToken);
      expect(result.user.email).toBe(email);
      expect(mockUser.comparePassword).toHaveBeenCalledWith(password);
      expect(mockUserRepository.updateLastLogin).toHaveBeenCalledWith(mockUser._id);
    });

    it('should throw 401 error when user not found', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(authService.login('nonexistent@example.com', 'password'))
        .rejects
        .toThrow(ApiError);

      await expect(authService.login('nonexistent@example.com', 'password'))
        .rejects
        .toMatchObject({ statusCode: 401 });
    });

    it('should throw 401 error when user is inactive', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        isActive: false,
        banned: false
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(authService.login('test@example.com', 'password'))
        .rejects
        .toThrow(ApiError);

      await expect(authService.login('test@example.com', 'password'))
        .rejects
        .toMatchObject({ statusCode: 401 });
    });

    it('should throw 403 error when user is banned', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        isActive: true,
        banned: true
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(authService.login('test@example.com', 'password'))
        .rejects
        .toThrow(ApiError);

      await expect(authService.login('test@example.com', 'password'))
        .rejects
        .toMatchObject({ statusCode: 403 });
    });

    it('should throw 401 error when password is invalid', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        isActive: true,
        banned: false,
        comparePassword: jest.fn().mockResolvedValue(false)
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(authService.login('test@example.com', 'wrongpassword'))
        .rejects
        .toThrow(ApiError);

      await expect(authService.login('test@example.com', 'wrongpassword'))
        .rejects
        .toMatchObject({ statusCode: 401 });
    });
  });

  describe('getProfile', () => {
    it('should return user profile when user exists', async () => {
      const mockUser = {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        toPublicJSON: jest.fn().mockReturnValue({
          _id: 'user123',
          name: 'Test User',
          email: 'test@example.com'
        })
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await authService.getProfile('user123');

      expect(result.name).toBe('Test User');
      expect(mockUserRepository.findById).toHaveBeenCalledWith('user123');
    });

    it('should throw 404 error when user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(authService.getProfile('nonexistent'))
        .rejects
        .toThrow(ApiError);

      await expect(authService.getProfile('nonexistent'))
        .rejects
        .toMatchObject({ statusCode: 404 });
    });
  });

  describe('updateProfile', () => {
    it('should update user profile successfully', async () => {
      const userId = 'user123';
      const updateData = { name: 'Updated Name', phone: '+9876543210', email: 'new@example.com' };
      const mockUpdatedUser = {
        _id: userId,
        ...updateData,
        toPublicJSON: jest.fn().mockReturnValue({
          _id: userId,
          name: updateData.name,
          phone: updateData.phone,
          email: updateData.email
        })
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.update.mockResolvedValue(mockUpdatedUser);

      const result = await authService.updateProfile(userId, updateData);

      expect(result.name).toBe(updateData.name);
      expect(mockUserRepository.update).toHaveBeenCalledWith(userId, updateData);
    });

    it('should throw 400 error when email already exists', async () => {
      const userId = 'user123';
      const updateData = { name: 'New Name', phone: '+1111111111', email: 'existing@example.com' };
      const existingUser = createTestUser({ email: updateData.email });

      mockUserRepository.findByEmail.mockResolvedValue(existingUser);

      await expect(authService.updateProfile(userId, updateData))
        .rejects
        .toThrow(ApiError);

      await expect(authService.updateProfile(userId, updateData))
        .rejects
        .toMatchObject({ statusCode: 400 });
    });

    it('should throw 404 error when user not found', async () => {
      const userId = 'nonexistent';
      const updateData = { name: 'New Name', phone: '+1111111111', email: 'new@example.com' };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.update.mockResolvedValue(null);

      await expect(authService.updateProfile(userId, updateData))
        .rejects
        .toThrow(ApiError);

      await expect(authService.updateProfile(userId, updateData))
        .rejects
        .toMatchObject({ statusCode: 404 });
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const userId = 'user123';
      const oldPassword = 'oldpassword';
      const newPassword = 'newpassword';
      const mockUser = {
        _id: userId,
        email: 'test@example.com',
        comparePassword: jest.fn().mockResolvedValue(true)
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockBcrypt.genSalt.mockResolvedValue('salt');
      mockBcrypt.hash.mockResolvedValue('hashedNewPassword');
      mockUserRepository.updatePassword.mockResolvedValue(mockUser);

      const result = await authService.changePassword(userId, oldPassword, newPassword);

      expect(result.message).toBeDefined();
      expect(mockBcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(mockBcrypt.hash).toHaveBeenCalledWith(newPassword, 'salt');
      expect(mockUserRepository.updatePassword).toHaveBeenCalledWith(userId, 'hashedNewPassword');
    });

    it('should throw 404 error when user not found by id', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(authService.changePassword('nonexistent', 'old', 'new'))
        .rejects
        .toThrow(ApiError);

      await expect(authService.changePassword('nonexistent', 'old', 'new'))
        .rejects
        .toMatchObject({ statusCode: 404 });
    });

    it('should throw 404 error when user not found by email', async () => {
      const mockUserById = { _id: 'user123', email: 'test@example.com' };
      mockUserRepository.findById.mockResolvedValue(mockUserById);
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(authService.changePassword('user123', 'old', 'new'))
        .rejects
        .toThrow(ApiError);

      await expect(authService.changePassword('user123', 'old', 'new'))
        .rejects
        .toMatchObject({ statusCode: 404 });
    });

    it('should throw 401 error when old password is incorrect', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        comparePassword: jest.fn().mockResolvedValue(false)
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(authService.changePassword('user123', 'wrongpassword', 'newpassword'))
        .rejects
        .toThrow(ApiError);

      await expect(authService.changePassword('user123', 'wrongpassword', 'newpassword'))
        .rejects
        .toMatchObject({ statusCode: 401 });
    });
  });

  describe('verifyToken', () => {
    it('should return decoded payload for valid token', () => {
      const token = 'valid-token';
      const decodedPayload = { id: 'user123', iat: Date.now() };

      mockJwt.verify.mockReturnValue(decodedPayload);

      const result = authService.verifyToken(token);

      expect(result).toEqual(decodedPayload);
      expect(mockJwt.verify).toHaveBeenCalledWith(token, mockConfig.jwt.secret);
    });

    it('should throw 401 error for invalid token', () => {
      const token = 'invalid-token';

      mockJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => authService.verifyToken(token))
        .toThrow(ApiError);
    });
  });

  describe('sendResetPasswordEmail', () => {
    it('should send reset password email successfully', async () => {
      const email = 'test@example.com';
      const mockUser = {
        _id: 'user123',
        email
      };
      const resetToken = 'reset-token';

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockJwt.sign.mockReturnValue(resetToken);

      const result = await authService.sendResetPasswordEmail(email);

      expect(result.message).toBeDefined();
      expect(result.token).toBe(resetToken);
      expect(mockJwt.sign).toHaveBeenCalledWith(
        { id: mockUser._id, type: 'reset' },
        mockConfig.jwt.secret,
        { expiresIn: '1h' }
      );
    });

    it('should throw 404 error when user not found', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(authService.sendResetPasswordEmail('nonexistent@example.com'))
        .rejects
        .toThrow(ApiError);

      await expect(authService.sendResetPasswordEmail('nonexistent@example.com'))
        .rejects
        .toMatchObject({ statusCode: 404 });
    });
  });

  describe('verifyResetToken', () => {
    it('should return payload for valid reset token', () => {
      const token = 'valid-reset-token';
      const payload = { id: 'user123', type: 'reset' };

      mockJwt.verify.mockReturnValue(payload);

      const result = authService.verifyResetToken(token);

      expect(result).toEqual(payload);
    });

    it('should throw 401 error when token type is not reset', () => {
      const token = 'auth-token';
      const payload = { id: 'user123', type: 'auth' };

      mockJwt.verify.mockReturnValue(payload);

      expect(() => authService.verifyResetToken(token))
        .toThrow(ApiError);
    });

    it('should throw 401 error for invalid token', () => {
      const token = 'invalid-token';

      mockJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => authService.verifyResetToken(token))
        .toThrow(ApiError);
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully with valid token', async () => {
      const token = 'valid-reset-token';
      const newPassword = 'newpassword123';
      const payload = { id: 'user123', type: 'reset' };
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com'
      };

      mockJwt.verify.mockReturnValue(payload);
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockBcrypt.genSalt.mockResolvedValue('salt');
      mockBcrypt.hash.mockResolvedValue('hashedNewPassword');
      mockUserRepository.updatePassword.mockResolvedValue(mockUser);

      const result = await authService.resetPassword(token, newPassword);

      expect(result.message).toBeDefined();
      expect(mockBcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(mockBcrypt.hash).toHaveBeenCalledWith(newPassword, 'salt');
      expect(mockUserRepository.updatePassword).toHaveBeenCalledWith('user123', 'hashedNewPassword');
    });

    it('should throw 404 error when user not found', async () => {
      const token = 'valid-reset-token';
      const payload = { id: 'nonexistent', type: 'reset' };

      mockJwt.verify.mockReturnValue(payload);
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(authService.resetPassword(token, 'newpassword'))
        .rejects
        .toThrow(ApiError);

      await expect(authService.resetPassword(token, 'newpassword'))
        .rejects
        .toMatchObject({ statusCode: 404 });
    });

    it('should throw 401 error for invalid reset token', async () => {
      const token = 'invalid-token';

      mockJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(authService.resetPassword(token, 'newpassword'))
        .rejects
        .toThrow(ApiError);
    });
  });
});
