import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import userRepository from '../repositories/user.repository.js';
import ApiError from '../utils/ApiError.js';
import ERROR_MESSAGES from '../utils/errorMessages.js';
import config from '../config/config.js';
import { BrevoEmailService } from '../infrastructure/email/brevoEmailService.js';
import { SendResetPassword } from '../infrastructure/email/sendResetPassword.js';

const authService = {
    // Generate JWT token
    generateToken(userId) {
        return jwt.sign(
            { id: userId },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
        );
    },

    // Register new user
    async register(userData) {
        const { name, email, phone, password } = userData;

        // Check if user already exists
        const existingUser = await userRepository.findByEmail(email);
        if (existingUser) {
            throw new ApiError(400, ERROR_MESSAGES.AUTH.EMAIL_ALREADY_EXISTS);
        }

        // Create user
        const user = await userRepository.create({
            name,
            email,
            phone,
            password
        });

        // Generate token
        const token = this.generateToken(user._id);

        return {
            token,
            user: user.toPublicJSON()
        };
    },

    // Login user
    async login(email, password) {
        // Find user with password field
        const user = await userRepository.findByEmail(email);

        if (!user) {
            throw new ApiError(401, ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS);
        }

        // Check if user is active
        if (!user.isActive) {
            throw new ApiError(401, ERROR_MESSAGES.AUTH.ACCOUNT_DISABLED);
        }

        // Check if user is banned
        if (user.banned) {
            throw new ApiError(403, ERROR_MESSAGES.AUTH.ACCOUNT_BANNED);
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            throw new ApiError(401, ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS);
        }

        // Update last login
        await userRepository.updateLastLogin(user._id);

        // Generate token
        const token = this.generateToken(user._id);

        return {
            token,
            user: user.toPublicJSON()
        };
    },

    // Get user profile
    async getProfile(userId) {
        const user = await userRepository.findById(userId);

        if (!user) {
            throw new ApiError(404, ERROR_MESSAGES.AUTH.USER_NOT_FOUND);
        }

        return user.toPublicJSON();
    },

    // Update user profile
    async updateProfile(userId, updateData) {
        const { name, phone, email } = updateData;

        // Check if user exists
        const existingUser = await userRepository.findByEmail(email);
        if (existingUser) {
            throw new ApiError(400, ERROR_MESSAGES.AUTH.EMAIL_EXISTS(email));
        }

        // Don't allow email or password update through this method
        const allowedUpdates = { name, phone, email };

        const user = await userRepository.update(userId, allowedUpdates);

        if (!user) {
            throw new ApiError(404, ERROR_MESSAGES.AUTH.USER_NOT_FOUND);
        }

        return user.toPublicJSON();
    },

    // Change password
    async changePassword(userId, oldPassword, newPassword) {
        // Get user by ID first
        const userById = await userRepository.findById(userId);

        if (!userById) {
            throw new ApiError(404, ERROR_MESSAGES.AUTH.USER_NOT_FOUND);
        }

        // Get user with password field
        const user = await userRepository.findByEmail(userById.email);

        if (!user) {
            throw new ApiError(404, ERROR_MESSAGES.AUTH.USER_NOT_FOUND);
        }

        // Verify old password
        const isPasswordValid = await user.comparePassword(oldPassword);
        if (!isPasswordValid) {
            throw new ApiError(401, ERROR_MESSAGES.AUTH.WRONG_PASSWORD);
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        await userRepository.updatePassword(userId, hashedPassword);

        return { message: 'Mật khẩu thay đổi thành công' };
    },

    // Verify token
    /**
     * Verify JWT token
     * @param {string} token - JWT token
     * @returns {Promise<string>} Decoded token
     * @throws {ApiError} If token is invalid or expired
     */
    verifyToken(token) {
        try {
            return jwt.verify(token, config.jwt.secret);
        } catch (error) {
            throw new ApiError(401, ERROR_MESSAGES.AUTH.INVALID_TOKEN, error);
        }
    },

    // Send password reset email (generates a reset token)
    async sendResetPasswordEmail(email) {
        // Find user by email
        const user = await userRepository.findByEmail(email);

        if (!user) {
            throw new ApiError(404, ERROR_MESSAGES.AUTH.USER_NOT_FOUND);
        }

        // Create a short-lived reset token
        const token = jwt.sign(
            { id: user._id, type: 'reset' },
            config.jwt.secret,
            { expiresIn: '1h' }
        );

        // Construct a reset URL (for dev/demo purposes)
        const emailService = new BrevoEmailService();
        const useCase = new SendResetPassword(emailService);
        const resetUrl = `${config.web_path}/reset-password?token=${token}`;
        const result = await useCase.execute(email, resetUrl);

        console.info(result);

        // TODO: Integrate real email service. For now, log the URL.
        // In production, send `resetUrl` to user's email address.
        console.info(`URL đặt lại mật khẩu cho ${email}: ${resetUrl}`);

        return { message: 'Email đặt lại mật khẩu đã được gửi', resetUrl, token };
    },

    // Verify reset token specifically
    verifyResetToken(token) {
        try {
            const payload = jwt.verify(token, config.jwt.secret);
            if (payload.type !== 'reset') {
                throw new ApiError(401, ERROR_MESSAGES.AUTH.INVALID_RESET_TOKEN);
            }
            return payload;
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError(401, ERROR_MESSAGES.AUTH.RESET_TOKEN_EXPIRED);
        }
    },

    // Reset password using token
    async resetPassword(token, newPassword) {
        // Verify token and extract user id
        const payload = this.verifyResetToken(token);

        const userId = payload.id;

        const user = await userRepository.findById(userId);
        if (!user) {
            throw new ApiError(404, ERROR_MESSAGES.AUTH.USER_NOT_FOUND);
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await userRepository.updatePassword(userId, hashedPassword);

        return { message: 'Mật khẩu đã được đặt lại thành công' };
    }
};

export default authService;