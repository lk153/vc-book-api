import categoryService from '../services/category.service.js';
import catchAsync from '../utils/catchAsync.js';
import {
  toCategoryDTO,
  toCategoryListDTO,
  toCategoryAdminDTO,
  toCategoryAdminListDTO
} from '../dtos/index.js';

const categoryController = {
  // ==================== Public Endpoints ====================

  getAllCategories: catchAsync(async (req, res) => {
    const categories = await categoryService.getAllCategories();

    res.json({
      success: true,
      data: toCategoryListDTO(categories)
    });
  }),

  getCategoryById: catchAsync(async (req, res) => {
    const category = await categoryService.getCategoryById(req.params.categoryId);

    res.json({
      success: true,
      data: toCategoryDTO(category)
    });
  }),

  // ==================== Admin Endpoints ====================

  getAllCategoriesAdmin: catchAsync(async (req, res) => {
    const filters = {
      page: Number.parseInt(req.query.page) || 1,
      limit: Number.parseInt(req.query.limit) || 20,
      search: req.query.search
    };

    const result = await categoryService.getAllCategoriesAdmin(filters);

    res.json({
      success: true,
      data: toCategoryAdminListDTO(result.categories),
      pagination: result.pagination
    });
  }),

  getCategoryByIdAdmin: catchAsync(async (req, res) => {
    const category = await categoryService.getCategoryByIdAdmin(req.params.categoryId);

    res.json({
      success: true,
      data: toCategoryAdminDTO(category)
    });
  }),

  createCategory: catchAsync(async (req, res) => {
    const category = await categoryService.createCategory(req.body);

    res.status(201).json({
      success: true,
      message: 'Danh mục được tạo thành công',
      data: toCategoryAdminDTO(category)
    });
  }),

  updateCategory: catchAsync(async (req, res) => {
    const category = await categoryService.updateCategory(req.params.categoryId, req.body);

    res.json({
      success: true,
      message: 'Danh mục đã cập nhật thành công',
      data: toCategoryAdminDTO(category)
    });
  }),

  deleteCategory: catchAsync(async (req, res) => {
    await categoryService.deleteCategory(req.params.categoryId);

    res.json({
      success: true,
      message: 'Danh mục đã xóa thành công'
    });
  })
};

export default categoryController;
