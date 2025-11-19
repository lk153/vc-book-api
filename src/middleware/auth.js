import jwt from 'jsonwebtoken';
import ApiError from '../utils/ApiError.js';
import config from '../config/config.js';
import userRepository from '../repositories/user.repository.js';

export const authenticate = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith('Bearer ')) {
            throw new ApiError(401, 'No token provided');
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, config.jwt.secret);

        // Get user
        const user = await userRepository.findById(decoded.id);

        if (!user || !user.isActive) {
            throw new ApiError(401, 'Invalid token or user not found');
        }

        // Attach user to request
        req.user = {
            id: user._id,
            email: user.email,
            role: user.role
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            next(new ApiError(401, 'Invalid token'));
        } else if (error.name === 'TokenExpiredError') {
            next(new ApiError(401, 'Token expired'));
        } else {
            next(error);
        }
    }
};

// Middleware to check if user is admin
export const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        throw new ApiError(403, 'Access denied. Admin only.');
    }
    next();
};