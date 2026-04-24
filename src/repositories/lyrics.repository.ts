import prisma from '../config/database';

export const findBySongId = (songId: number) => {
  return prisma.lyrics.findUnique({
    where: { songId },
  });
};

export const create = (data: { songId: number; content: string; offset?: number }) => {
  return prisma.lyrics.create({
    data: {
      songId: data.songId,
      content: data.content,
      offset: data.offset ?? 0,
    },
  });
};

export const update = (songId: number, data: { content?: string; offset?: number }) => {
  return prisma.lyrics.update({
    where: { songId },
    data,
  });
};

export const upsert = (data: { songId: number; content: string; offset?: number }) => {
  return prisma.lyrics.upsert({
    where: { songId: data.songId },
    update: {
      content: data.content,
      offset: data.offset ?? 0,
    },
    create: {
      songId: data.songId,
      content: data.content,
      offset: data.offset ?? 0,
    },
  });
};
