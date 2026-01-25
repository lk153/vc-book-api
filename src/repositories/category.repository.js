import Category from '../models/category.model.js';
import Book from '../models/book.model.js';

const categoryRepository = {
  async findAll(filters = {}, pagination = {}) {
    const query = {};

    // Only show active categories for public routes
    if (filters.activeOnly) {
      query.isActive = true;
    }

    // Search by name
    if (filters.search) {
      query.name = { $regex: filters.search, $options: 'i' };
    }

    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    return await Category.find(query)
      .collation({ locale: 'en', strength: 2 })
      .sort({ name: 1 }) // Alphabetical order
      .skip(skip)
      .limit(limit);
  },

  async countAll(filters = {}) {
    const query = {};

    if (filters.activeOnly) {
      query.isActive = true;
    }

    if (filters.search) {
      query.name = { $regex: filters.search, $options: 'i' };
    }

    return await Category.countDocuments(query);
  },

  async findById(id) {
    return await Category.findById(id);
  },

  async findByName(name) {
    return await Category.findOne({ name })
      .collation({ locale: 'en', strength: 2 });
  },

  async findActiveByName(name) {
    return await Category.findOne({ name, isActive: true })
      .collation({ locale: 'en', strength: 2 });
  },

  async create(categoryData) {
    const category = new Category(categoryData);
    return await category.save();
  },

  async update(id, categoryData) {
    return await Category.findByIdAndUpdate(
      id,
      { $set: categoryData },
      { new: true, runValidators: true }
    );
  },

  async delete(id) {
    // Hard delete - set books with this category to uncategorized
    const category = await Category.findById(id);
    if (!category) return false;

    // Update all books with this category to have no category
    await Book.updateMany(
      { category: category.name },
      { $unset: { category: '' } }
    );

    await Category.findByIdAndDelete(id);
    return true;
  },

  async getBookCount(categoryName) {
    return await Book.countDocuments({
      category: categoryName,
      isActive: true
    });
  },

  async getBookCountsForCategories(categoryNames) {
    const counts = await Book.aggregate([
      {
        $match: {
          category: { $in: categoryNames },
          isActive: true
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    // Convert to map for easy lookup
    const countMap = {};
    for (const item of counts) {
      countMap[item._id] = item.count;
    }
    return countMap;
  },

  async existsByName(name, excludeId = null) {
    const query = { name };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    const existing = await Category.findOne(query)
      .collation({ locale: 'en', strength: 2 });
    return !!existing;
  }
};

export default categoryRepository;
