import prisma from '../config/database';

interface FindAllParams {
  page?: number;
  pageSize?: number;
  artistId?: number;
}

export const albumRepository = {
  async findAll(params?: FindAllParams) {
    const { page = 1, pageSize = 20, artistId } = params || {};
    const skip = (page - 1) * pageSize;
    const where: any = {};
    if (artistId) where.artistId = artistId;

    const [list, total] = await Promise.all([
      prisma.album.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          artist: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.album.count({ where }),
    ]);

    return { list, total, page, pageSize };
  },

  async findById(id: number) {
    return prisma.album.findUnique({
      where: { id },
      include: {
        artist: true,
        songs: true,
      },
    });
  },

  async findOrCreate(name: string, artistId?: number) {
    const where: any = { name };
    if (artistId) where.artistId = artistId;

    const existing = await prisma.album.findFirst({ where });
    if (existing) return existing;

    return prisma.album.create({
      data: {
        name,
        artistId: artistId || null,
      },
    });
  },
};
