import { Request, Response } from 'express';
import { libraryService } from '../services/library.service';
import { success } from '../utils/response';
import { AppError } from '../middlewares/errorHandler';

export const libraryController = {
  async scan(req: Request, res: Response) {
    const { path: dirPath } = req.body;
    if (!dirPath) {
      throw new AppError(400, 400, 'Path is required');
    }
    const result = await libraryService.scan(dirPath);
    res.json(success(result));
  },
};
