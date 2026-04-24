import prisma from '../config/database';

export const addSong = async (playlistId: number, songId: number) => {
  const maxOrder = await prisma.playlistSong.findFirst({
    where: { playlistId },
    orderBy: { order: 'desc' },
    select: { order: true },
  });

  return prisma.playlistSong.create({
    data: {
      playlistId,
      songId,
      order: (maxOrder?.order ?? -1) + 1,
    },
  });
};

export const removeSong = async (playlistId: number, songId: number) => {
  return prisma.playlistSong.delete({
    where: {
      playlistId_songId: { playlistId, songId },
    },
  });
};

export const reorder = async (playlistId: number, songOrders: { songId: number; order: number }[]) => {
  const updates = songOrders.map(({ songId, order }) =>
    prisma.playlistSong.update({
      where: {
        playlistId_songId: { playlistId, songId },
      },
      data: { order },
    })
  );

  return prisma.$transaction(updates);
};

export const findByPlaylistAndSong = async (playlistId: number, songId: number) => {
  return prisma.playlistSong.findUnique({
    where: {
      playlistId_songId: { playlistId, songId },
    },
  });
};
