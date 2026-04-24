import { Request, Response } from 'express';
import { songService } from '../services/song.service';
import { success } from '../utils/response';

export const songController = {
  async getSongs(req: Request, res: Response) {
    const page = req.query.page ? Number(req.query.page) : 1;
    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 20;
    const albumId = req.query.albumId ? Number(req.query.albumId) : undefined;
    const artistId = req.query.artistId ? Number(req.query.artistId) : undefined;

    const result = await songService.getSongs({ page, pageSize, albumId, artistId });
    res.json(success(result));
  },

  async getSongById(req: Request, res: Response) {
    const id = Number(req.params.id);
    const song = await songService.getSongById(id);
    res.json(success(song));
  },

  async deleteSong(req: Request, res: Response) {
    const id = Number(req.params.id);
    await songService.deleteSong(id);
    res.json(success(null, 'Song deleted'));
  },
};
