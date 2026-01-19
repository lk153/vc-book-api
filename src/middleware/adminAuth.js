import jwt from 'jsonwebtoken';
import ApiError from '../utils/ApiError.js';
import config from '../config/config.js';
import adminRepository from '../repositories/admin.repository.js';

/**
 * Middleware to authenticate admin users
 * Verifies JWT token and checks if user is admin
 */
export const authenticateAdmin = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new ApiError(401, 'Unauthorized');
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Check if it's an admin token
    if (!decoded.isAdmin) {
      throw new ApiError(401, 'Unauthorized');
    }

    // Get admin from database
    const admin = await adminRepository.findById(decoded.id);

    if (!admin || !admin.isActive) {
      throw new ApiError(401, 'Unauthorized');
    }

    // Attach admin to request
    req.admin = {
      id: admin._id,
      username: admin.username,
      name: admin.name
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(new ApiError(401, 'Unauthorized'));
    } else if (error.name === 'TokenExpiredError') {
      next(new ApiError(401, 'Unauthorized'));
    } else {
      next(error);
    }
  }
};

export default authenticateAdmin;
