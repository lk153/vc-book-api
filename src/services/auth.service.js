import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import userRepository from '../repositories/user.repository.js';
import ApiError from '../utils/ApiError.js';
import config from '../config/config.js';

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
            throw new ApiError(400, 'Email already registered');
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
            throw new ApiError(401, 'Invalid email or password');
        }

        // Check if user is active
        if (!user.isActive) {
            throw new ApiError(401, 'Account is deactivated');
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            throw new ApiError(401, 'Invalid email or password');
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
            throw new ApiError(404, 'User not found');
        }

        return user.toPublicJSON();
    },

    // Update user profile
    async updateProfile(userId, updateData) {
        const { name, phone, email } = updateData;

        // Check if user exists
        const existingUser = await userRepository.findByEmail(email);
        if (existingUser) {
            throw new ApiError(400, 'Email ' + email + ' already existed');
        }

        // Don't allow email or password update through this method
        const allowedUpdates = { name, phone, email };

        const user = await userRepository.update(userId, allowedUpdates);

        if (!user) {
            throw new ApiError(404, 'User not found');
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
            throw new ApiError(404, 'User not found');
        }

        // Verify old password
        const isPasswordValid = await user.comparePassword(oldPassword);
        if (!isPasswordValid) {
            throw new ApiError(401, 'Current password is incorrect');
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        await userRepository.updatePassword(userId, hashedPassword);

        return { message: 'Password changed successfully' };
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
            throw new ApiError(401, 'Invalid or expired token', error);
        }
    }
};

export default authService;