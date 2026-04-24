import prisma from '../config/database';

interface FindAllParams {
  page?: number;
  pageSize?: number;
  albumId?: number;
  artistId?: number;
}

interface CreateSongData {
  title: string;
  filePath: string;
  duration?: number;
  bitrate?: number;
  sampleRate?: number;
  format?: string;
  fileSize?: number;
  coverPath?: string;
  albumId?: number;
  artistId?: number;
}

export const songRepository = {
  async findAll(params: FindAllParams) {
    const { page = 1, pageSize = 20, albumId, artistId } = params;
    const skip = (page - 1) * pageSize;
    const where: any = {};
    if (albumId) where.albumId = albumId;
    if (artistId) where.artistId = artistId;

    const [list, total] = await Promise.all([
      prisma.song.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          album: true,
          artist: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.song.count({ where }),
    ]);

    return { list, total, page, pageSize };
  },

  async findById(id: number) {
    return prisma.song.findUnique({
      where: { id },
      include: {
        album: true,
        artist: true,
        lyrics: true,
      },
    });
  },

  async findByFilePath(filePath: string) {
    return prisma.song.findUnique({
      where: { filePath },
    });
  },

  async create(data: CreateSongData) {
    return prisma.song.create({
      data,
    });
  },

  async delete(id: number) {
    return prisma.song.delete({
      where: { id },
    });
  },

  async count(params?: { albumId?: number; artistId?: number }) {
    const where: any = {};
    if (params?.albumId) where.albumId = params.albumId;
    if (params?.artistId) where.artistId = params.artistId;
    return prisma.song.count({ where });
  },
};
