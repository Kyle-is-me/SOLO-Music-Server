import { Request, Response } from 'express';
import * as playHistoryService from '../services/playHistory.service';
import { success } from '../utils/response';
import { AppError } from '../middlewares/errorHandler';

export const getHistory = async (req: Request, res: Response) => {
  const page = req.query.page ? Number(req.query.page) : undefined;
  const pageSize = req.query.pageSize ? Number(req.query.pageSize) : undefined;

  const result = await playHistoryService.getHistory({ page, pageSize });
  res.json(success(result));
};

export const recordPlay = async (req: Request, res: Response) => {
  const songId = Number(req.params.songId);

  if (isNaN(songId) || songId <= 0) {
    throw new AppError(400, 4001, 'Invalid songId');
  }

  const record = await playHistoryService.recordPlay(songId);
  res.json(success(record));
};
