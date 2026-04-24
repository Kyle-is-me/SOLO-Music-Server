import * as favoriteRepository from '../repositories/favorite.repository';
import { AppError } from '../middlewares/errorHandler';

export const getFavorites = async (params?: { page?: number; pageSize?: number }) => {
  const result = await favoriteRepository.findAll(params);
  const totalPages = Math.ceil(result.total / result.pageSize);

  return {
    items: result.items,
    pagination: {
      page: result.page,
      pageSize: result.pageSize,
      total: result.total,
      totalPages,
    },
  };
};

export const addFavorite = async (songId: number) => {
  const existing = await favoriteRepository.findBySongId(songId);
  if (existing) {
    return existing;
  }
  return favoriteRepository.create(songId);
};

export const removeFavorite = async (songId: number) => {
  const existing = await favoriteRepository.findBySongId(songId);
  if (!existing) {
    throw new AppError(404, 404, '收藏记录不存在');
  }
  return favoriteRepository.deleteBySongId(songId);
};
