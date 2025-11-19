import authService from '../services/auth.service.js';
import catchAsync from '../utils/catchAsync.js';

const authController = {
    // Register
    register: catchAsync(async (req, res) => {
        const { name, email, phone, password } = req.body;

        const result = await authService.register({
            name,
            email,
            phone,
            password
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token: result.token,
            user: result.user
        });
    }),

    // Login
    login: catchAsync(async (req, res) => {
        const { email, password } = req.body;

        const result = await authService.login(email, password);

        res.json({
            success: true,
            message: 'Login successful',
            token: result.token,
            user: result.user
        });
    }),

    // Logout (client-side will remove token)
    logout: catchAsync(async (req, res) => {
        res.json({
            success: true,
            message: 'Logout successful'
        });
    }),

    // Get Profile
    getProfile: catchAsync(async (req, res) => {
        const user = await authService.getProfile(req.user.id);

        res.json({
            success: true,
            data: user
        });
    }),

    // Update Profile
    updateProfile: catchAsync(async (req, res) => {
        const { name, phone, email } = req.body;
        
        const user = await authService.updateProfile(req.user.id, {
            name,
            phone,
            email
        });

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: user
        });
    }),

    // Change Password
    changePassword: catchAsync(async (req, res) => {
        const { currentPassword, newPassword } = req.body;

        await authService.changePassword(
            req.user.id,
            currentPassword,
            newPassword
        );

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    })
};

export default authController;