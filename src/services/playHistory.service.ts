import * as playHistoryRepo from '../repositories/playHistory.repository';
import { AppError } from '../middlewares/errorHandler';

export const getHistory = async (params?: { page?: number; pageSize?: number }) => {
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 20;

  const [list, total] = await Promise.all([
    playHistoryRepo.findAll(params),
    playHistoryRepo.count(),
  ]);

  return {
    list,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
};

export const recordPlay = async (songId: number) => {
  const record = await playHistoryRepo.create(songId);
  if (!record) {
    throw new AppError(500, 5001, 'Failed to record play history');
  }
  return record;
};
