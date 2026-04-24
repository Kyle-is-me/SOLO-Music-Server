import prisma from '../config/database';
import { AppError } from '../middlewares/errorHandler';

type SearchType = 'song' | 'album' | 'artist';

interface SearchResult {
  songs?: any[];
  albums?: any[];
  artists?: any[];
}

export const searchService = {
  async search(keyword: string, type?: SearchType): Promise<SearchResult> {
    if (!keyword || keyword.trim() === '') {
      throw new AppError(400, 400, 'Search keyword is required');
    }

    const result: SearchResult = {};

    if (!type || type === 'song') {
      result.songs = await prisma.song.findMany({
        where: { title: { contains: keyword } },
        include: {
          album: true,
          artist: true,
        },
      });
    }

    if (!type || type === 'album') {
      result.albums = await prisma.album.findMany({
        where: { name: { contains: keyword } },
        include: {
          artist: true,
          _count: { select: { songs: true } },
        },
      });
    }

    if (!type || type === 'artist') {
      result.artists = await prisma.artist.findMany({
        where: { name: { contains: keyword } },
        include: {
          _count: { select: { albums: true, songs: true } },
        },
      });
    }

    return result;
  },
};
