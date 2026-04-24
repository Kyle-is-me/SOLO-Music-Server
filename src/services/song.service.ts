import { songRepository } from '../repositories/song.repository';
import { AppError } from '../middlewares/errorHandler';

interface GetSongsParams {
  page?: number;
  pageSize?: number;
  albumId?: number;
  artistId?: number;
}

export const songService = {
  async getSongs(params: GetSongsParams) {
    const result = await songRepository.findAll(params);
    return {
      list: result.list,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    };
  },

  async getSongById(id: number) {
    const song = await songRepository.findById(id);
    if (!song) {
      throw new AppError(404, 404, 'Song not found');
    }
    return song;
  },

  async deleteSong(id: number) {
    const song = await songRepository.findById(id);
    if (!song) {
      throw new AppError(404, 404, 'Song not found');
    }
    return songRepository.delete(id);
  },
};
