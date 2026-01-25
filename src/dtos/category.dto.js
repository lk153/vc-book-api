/**
 * Category DTO - Shapes category data for API responses
 */

// Public category DTO (minimal data)
export const toCategoryDTO = (category) => {
  if (!category) return null;

  return {
    id: category._id || category.id,
    name: category.name,
    description: category.description || ''
  };
};

export const toCategoryListDTO = (categories) => {
  if (!categories || !Array.isArray(categories)) return [];
  return categories.map(toCategoryDTO);
};

// Admin category DTO (includes metadata)
export const toCategoryAdminDTO = (category) => {
  if (!category) return null;

  return {
    id: category._id || category.id,
    name: category.name,
    description: category.description || '',
    bookCount: category.bookCount || 0,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt
  };
};

export const toCategoryAdminListDTO = (categories) => {
  if (!categories || !Array.isArray(categories)) return [];
  return categories.map(toCategoryAdminDTO);
};

export default {
  toCategoryDTO,
  toCategoryListDTO,
  toCategoryAdminDTO,
  toCategoryAdminListDTO
};
