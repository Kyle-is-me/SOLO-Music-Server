import { Request, Response } from 'express';
import { artistRepository } from '../repositories/artist.repository';
import { success } from '../utils/response';
import { AppError } from '../middlewares/errorHandler';

export const artistController = {
  async getArtists(req: Request, res: Response) {
    const page = req.query.page ? Number(req.query.page) : 1;
    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 20;

    const result = await artistRepository.findAll({ page, pageSize });
    res.json(success(result));
  },

  async getArtistById(req: Request, res: Response) {
    const id = Number(req.params.id);
    const artist = await artistRepository.findById(id);
    if (!artist) {
      throw new AppError(404, 404, 'Artist not found');
    }
    res.json(success(artist));
  },
};
