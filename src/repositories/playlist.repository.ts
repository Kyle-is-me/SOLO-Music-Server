import prisma from '../config/database';

export const findAll = async () => {
  return prisma.playlist.findMany({
    include: {
      _count: {
        select: { songs: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const findById = async (id: number) => {
  return prisma.playlist.findUnique({
    where: { id },
    include: {
      songs: {
        include: {
          song: {
            include: {
              album: true,
              artist: true,
            },
          },
        },
        orderBy: { order: 'asc' },
      },
    },
  });
};

export const create = async (data: { name: string; description?: string; coverPath?: string }) => {
  return prisma.playlist.create({
    data,
  });
};

export const update = async (id: number, data: { name?: string; description?: string; coverPath?: string }) => {
  return prisma.playlist.update({
    where: { id },
    data,
  });
};

export const remove = async (id: number) => {
  return prisma.playlist.delete({
    where: { id },
  });
};
