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
            message: 'Đăng ký thành công',
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
            message: 'Đăng nhập thành công',
            token: result.token,
            user: result.user
        });
    }),

    // Logout (client-side will remove token)
    logout: catchAsync(async (req, res) => {
        res.json({
            success: true,
            message: 'Đăng xuất thành công'
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
        const user = await authService.updateProfile(req.user.id, { name, phone, email });
        res.json({
            success: true,
            message: 'Hồ sơ cập nhật thành công',
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
            message: 'Mật khẩu đã được thay đổi thành công'
        });
    })

    ,

    // Forgot Password - send reset email
    forgotPassword: catchAsync(async (req, res) => {
        const { email } = req.body;

        const result = await authService.sendResetPasswordEmail(email);

        res.json({
            success: true,
            message: 'If the email exists, a reset link has been sent',
            // returning token/resetUrl for development and testing
            resetUrl: result.resetUrl,
            token: result.token
        });
    }),

    // Verify reset token
    verifyResetToken: catchAsync(async (req, res) => {
        const { token } = req.body;

        await authService.verifyResetToken(token);

        res.json({
            success: true,
            message: 'Reset token is valid'
        });
    }),

    // Reset password
    resetPassword: catchAsync(async (req, res) => {
        const { token, password } = req.body;

        await authService.resetPassword(token, password);

        res.json({
            success: true,
            message: 'Đã đặt lại mật khẩu thành công'
        });
    })
};

export default authController;