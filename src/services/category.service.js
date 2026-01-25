import categoryRepository from '../repositories/category.repository.js';
import ApiError from '../utils/ApiError.js';

const categoryService = {
  // ==================== Public Methods ====================

  async getAllCategories() {
    // Get all active categories for public use
    const categories = await categoryRepository.findAll({ activeOnly: true }, { limit: 1000 });
    return categories;
  },

  async getCategoryById(id) {
    const category = await categoryRepository.findById(id);
    if (!category || !category.isActive) {
      throw new ApiError(404, 'Danh mục không được tìm thấy');
    }
    return category;
  },

  // ==================== Admin Methods ====================

  async getAllCategoriesAdmin(filters = {}) {
    const { page = 1, limit = 20, search } = filters;

    const queryFilters = {};
    if (search) {
      queryFilters.search = search;
    }

    const [categories, totalItems] = await Promise.all([
      categoryRepository.findAll(queryFilters, { page, limit }),
      categoryRepository.countAll(queryFilters)
    ]);

    // Get book counts for all categories
    const categoryNames = categories.map(c => c.name);
    const bookCounts = await categoryRepository.getBookCountsForCategories(categoryNames);

    // Attach book counts to categories
    const categoriesWithCounts = categories.map(category => ({
      ...category.toObject(),
      bookCount: bookCounts[category.name] || 0
    }));

    return {
      categories: categoriesWithCounts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
        itemsPerPage: limit
      }
    };
  },

  async getCategoryByIdAdmin(id) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new ApiError(404, 'Danh mục không được tìm thấy');
    }

    // Get book count
    const bookCount = await categoryRepository.getBookCount(category.name);

    return {
      ...category.toObject(),
      bookCount
    };
  },

  async createCategory(categoryData) {
    // Check if category name already exists
    const exists = await categoryRepository.existsByName(categoryData.name);
    if (exists) {
      throw new ApiError(409, 'Danh mục với tên này đã tồn tại');
    }

    const category = await categoryRepository.create(categoryData);
    return {
      ...category.toObject(),
      bookCount: 0
    };
  },

  async updateCategory(id, categoryData) {
    // Check if category exists
    const existingCategory = await categoryRepository.findById(id);
    if (!existingCategory) {
      throw new ApiError(404, 'Danh mục không được tìm thấy');
    }

    // If name is being changed, check for duplicates
    if (categoryData.name && categoryData.name !== existingCategory.name) {
      const exists = await categoryRepository.existsByName(categoryData.name, id);
      if (exists) {
        throw new ApiError(409, 'Danh mục với tên này đã tồn tại');
      }
    }

    const category = await categoryRepository.update(id, categoryData);

    // Get book count
    const bookCount = await categoryRepository.getBookCount(category.name);

    return {
      ...category.toObject(),
      bookCount
    };
  },

  async deleteCategory(id) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new ApiError(404, 'Danh mục không được tìm thấy');
    }

    const deleted = await categoryRepository.delete(id);
    if (!deleted) {
      throw new ApiError(500, 'Không thể xóa danh mục');
    }

    return true;
  }
};

export default categoryService;
