import prisma from '../config/database';

export const findAll = async (params?: { page?: number; pageSize?: number }) => {
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 20;
  const skip = (page - 1) * pageSize;

  const [items, total] = await Promise.all([
    prisma.favorite.findMany({
      include: {
        song: {
          include: {
            album: true,
            artist: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.favorite.count(),
  ]);

  return { items, total, page, pageSize };
};

export const findBySongId = async (songId: number) => {
  return prisma.favorite.findUnique({
    where: { songId },
  });
};

export const create = async (songId: number) => {
  return prisma.favorite.create({
    data: { songId },
  });
};

export const deleteBySongId = async (songId: number) => {
  return prisma.favorite.delete({
    where: { songId },
  });
};

export const count = async () => {
  return prisma.favorite.count();
};
