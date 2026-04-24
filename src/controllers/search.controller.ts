import { Request, Response } from 'express';
import { searchService } from '../services/search.service';
import { success } from '../utils/response';

export const searchController = {
  async search(req: Request, res: Response) {
    const keyword = req.query.q as string;
    const type = req.query.type as string | undefined;

    const result = await searchService.search(keyword, type as any);
    res.json(success(result));
  },
};
