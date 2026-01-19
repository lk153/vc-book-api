/**
 * User DTO - Shapes user data for API responses
 * Excludes sensitive fields like password, refreshToken
 */

export const toUserDTO = (user) => {
  if (!user) return null;

  return {
    id: user._id || user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isActive: user.isActive,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

export const toUserListDTO = (users) => {
  if (!users || !Array.isArray(users)) return [];
  return users.map(toUserDTO);
};

export const toAuthResponseDTO = (user, token) => {
  return {
    user: toUserDTO(user),
    token
  };
};

export default {
  toUserDTO,
  toUserListDTO,
  toAuthResponseDTO
};
