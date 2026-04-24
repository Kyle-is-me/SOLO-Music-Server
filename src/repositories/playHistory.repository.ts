import prisma from '../config/database';

export const findAll = async (params?: { page?: number; pageSize?: number }) => {
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 20;
  const skip = (page - 1) * pageSize;

  return prisma.playHistory.findMany({
    skip,
    take: pageSize,
    orderBy: { playedAt: 'desc' },
    include: {
      song: {
        include: {
          album: true,
          artist: true,
        },
      },
    },
  });
};

export const create = async (songId: number) => {
  return prisma.playHistory.create({
    data: { songId },
    include: {
      song: {
        include: {
          album: true,
          artist: true,
        },
      },
    },
  });
};

export const count = async () => {
  return prisma.playHistory.count();
};
