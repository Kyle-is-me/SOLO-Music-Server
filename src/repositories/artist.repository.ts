import prisma from '../config/database';

interface FindAllParams {
  page?: number;
  pageSize?: number;
}

export const artistRepository = {
  async findAll(params?: FindAllParams) {
    const { page = 1, pageSize = 20 } = params || {};
    const skip = (page - 1) * pageSize;

    const [list, total] = await Promise.all([
      prisma.artist.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.artist.count(),
    ]);

    return { list, total, page, pageSize };
  },

  async findById(id: number) {
    return prisma.artist.findUnique({
      where: { id },
      include: {
        albums: true,
        songs: true,
      },
    });
  },

  async findOrCreate(name: string) {
    const existing = await prisma.artist.findFirst({ where: { name } });
    if (existing) return existing;

    return prisma.artist.create({
      data: { name },
    });
  },
};
