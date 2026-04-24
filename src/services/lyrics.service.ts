import prisma from '../config/database';
import { AppError } from '../middlewares/errorHandler';
import * as lyricsRepo from '../repositories/lyrics.repository';

export const getLyrics = async (songId: number) => {
  const song = await prisma.song.findUnique({ where: { id: songId } });
  if (!song) {
    throw new AppError(404, 404, 'Song not found');
  }

  const lyrics = await lyricsRepo.findBySongId(songId);
  if (!lyrics) {
    throw new AppError(404, 404, 'Lyrics not found');
  }

  return lyrics;
};

export const updateLyrics = async (
  songId: number,
  data: { content: string; offset?: number },
) => {
  const song = await prisma.song.findUnique({ where: { id: songId } });
  if (!song) {
    throw new AppError(404, 404, 'Song not found');
  }

  return lyricsRepo.upsert({ songId, content: data.content, offset: data.offset });
};
