import User from '../models/User.model.js';

const userRepository = {
    async create(userData) {
        const user = new User(userData);
        await user.save();
        return user;
    },

    async findByEmail(email) {
        return await User.findOne({ email }).select('+password');
    },

    async findById(id) {
        return await User.findById(id);
    },

    async update(id, userData) {
        return await User.findByIdAndUpdate(
            id,
            { $set: userData },
            { new: true, runValidators: true }
        );
    },

    async updatePassword(id, hashedPassword) {
        return await User.findByIdAndUpdate(
            id,
            { $set: { password: hashedPassword } },
            { new: true }
        );
    },

    async updateLastLogin(id) {
        return await User.findByIdAndUpdate(
            id,
            { $set: { lastLogin: new Date() } },
            { new: true }
        );
    },

    async findAll(query = {}) {
        return await User.find(query).select('-password');
    },

    async delete(id) {
        return await User.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );
    }
};

export default userRepository;