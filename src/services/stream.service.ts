import path from 'path';
import fs from 'fs/promises';
import prisma from '../config/database';
import { AppError } from '../middlewares/errorHandler';

const MIME_TYPES: Record<string, string> = {
  '.mp3': 'audio/mpeg',
  '.flac': 'audio/flac',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.aac': 'audio/aac',
  '.m4a': 'audio/mp4',
};

interface StreamResult206 {
  statusCode: 206;
  headers: {
    'Content-Range': string;
    'Accept-Ranges': string;
    'Content-Length': number;
    'Content-Type': string;
  };
  filePath: string;
  start: number;
  end: number;
}

interface StreamResult200 {
  statusCode: 200;
  headers: {
    'Content-Length': number;
    'Content-Type': string;
    'Accept-Ranges': string;
  };
  filePath: string;
}

type StreamResult = StreamResult206 | StreamResult200;

export const getStreamInfo = async (songId: number, rangeHeader?: string): Promise<StreamResult> => {
  const song = await prisma.song.findUnique({ where: { id: songId } });
  if (!song) {
    throw new AppError(404, 404, 'Song not found');
  }

  try {
    await fs.access(song.filePath);
  } catch {
    throw new AppError(404, 404, 'Audio file not found');
  }

  const ext = path.extname(song.filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  const stat = await fs.stat(song.filePath);
  const fileSize = stat.size;

  if (rangeHeader) {
    const parts = rangeHeader.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const contentLength = end - start + 1;

    return {
      statusCode: 206,
      headers: {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': contentLength,
        'Content-Type': contentType,
      },
      filePath: song.filePath,
      start,
      end,
    };
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Length': fileSize,
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
    },
    filePath: song.filePath,
  };
};
