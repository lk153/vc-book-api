import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import userRepository from '../repositories/user.repository.js';
import ApiError from '../utils/ApiError.js';
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
            throw new ApiError(400, 'Email đã được đăng ký');
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
            throw new ApiError(401, 'Email hoặc mật khẩu không đúng');
        }

        // Check if user is active
        if (!user.isActive) {
            throw new ApiError(401, 'Tài khoản đã bị vô hiệu hóa');
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            throw new ApiError(401, 'Email hoặc mật khẩu không đúng');
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
            throw new ApiError(404, 'Người dùng không được tìm thấy');
        }

        return user.toPublicJSON();
    },

    // Update user profile
    async updateProfile(userId, updateData) {
        const { name, phone, email } = updateData;

        // Check if user exists
        const existingUser = await userRepository.findByEmail(email);
        if (existingUser) {
            throw new ApiError(400, 'Email ' + email + ' đã tồn tại');
        }

        // Don't allow email or password update through this method
        const allowedUpdates = { name, phone, email };

        const user = await userRepository.update(userId, allowedUpdates);

        if (!user) {
            throw new ApiError(404, 'Người dùng không được tìm thấy');
        }

        return user.toPublicJSON();
    },

    // Change password
    async changePassword(userId, oldPassword, newPassword) {
        // Get user with password
        const user = await userRepository.findByEmail(
            (await userRepository.findById(userId)).email
        );

        if (!user) {
            throw new ApiError(404, 'Người dùng không được tìm thấy');
        }

        // Verify old password
        const isPasswordValid = await user.comparePassword(oldPassword);
        if (!isPasswordValid) {
            throw new ApiError(401, 'Mật khẩu hiện tại không đúng');
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
            throw new ApiError(401, 'Token không hợp lệ hoặc đã hết hạn', error);
        }
    },

    // Send password reset email (generates a reset token)
    async sendResetPasswordEmail(email) {
        // Find user by email
        const user = await userRepository.findByEmail(email);

        if (!user) {
            throw new ApiError(404, 'Người dùng không được tìm thấy');
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
                throw new ApiError(401, 'Token đặt lại không hợp lệ');
            }
            return payload;
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError(401, 'Token đặt lại không hợp lệ hoặc đã hết hạn');
        }
    },

    // Reset password using token
    async resetPassword(token, newPassword) {
        // Verify token and extract user id
        const payload = this.verifyResetToken(token);

        const userId = payload.id;

        const user = await userRepository.findById(userId);
        if (!user) {
            throw new ApiError(404, 'Người dùng không được tìm thấy');
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await userRepository.updatePassword(userId, hashedPassword);

        return { message: 'Mật khẩu đã được đặt lại thành công' };
    }
};

export default authService;