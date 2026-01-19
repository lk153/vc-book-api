import Admin from '../models/admin.model.js';

const adminRepository = {
  async create(adminData) {
    const admin = new Admin(adminData);
    await admin.save();
    return admin;
  },

  async findByUsername(username) {
    return await Admin.findOne({ username }).select('+password');
  },

  async findById(id) {
    return await Admin.findById(id);
  },

  async update(id, adminData) {
    return await Admin.findByIdAndUpdate(
      id,
      { $set: adminData },
      { new: true, runValidators: true }
    );
  },

  async updateLastLogin(id) {
    return await Admin.findByIdAndUpdate(
      id,
      { $set: { lastLogin: new Date() } },
      { new: true }
    );
  },

  async exists(username) {
    return await Admin.exists({ username });
  }
};

export default adminRepository;
