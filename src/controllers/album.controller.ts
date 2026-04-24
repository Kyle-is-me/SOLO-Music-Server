import { Request, Response } from 'express';
import { albumRepository } from '../repositories/album.repository';
import { success } from '../utils/response';
import { AppError } from '../middlewares/errorHandler';

export const albumController = {
  async getAlbums(req: Request, res: Response) {
    const page = req.query.page ? Number(req.query.page) : 1;
    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 20;
    const artistId = req.query.artistId ? Number(req.query.artistId) : undefined;

    const result = await albumRepository.findAll({ page, pageSize, artistId });
    res.json(success(result));
  },

  async getAlbumById(req: Request, res: Response) {
    const id = Number(req.params.id);
    const album = await albumRepository.findById(id);
    if (!album) {
      throw new AppError(404, 404, 'Album not found');
    }
    res.json(success(album));
  },
};
