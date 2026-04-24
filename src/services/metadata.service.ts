import { parseFile } from 'music-metadata';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export interface ExtractedMetadata {
  title: string;
  artist: string;
  album: string;
  duration: number;
  bitrate: number;
  sampleRate: number;
  format: string;
  fileSize: number;
  coverPath: string;
}

const COVERS_DIR = path.join(process.cwd(), 'covers');

function ensureCoversDir() {
  if (!fs.existsSync(COVERS_DIR)) {
    fs.mkdirSync(COVERS_DIR, { recursive: true });
  }
}

async function saveCover(filePath: string, cover: any): Promise<string> {
  if (!cover || !cover.data || cover.data.length === 0) {
    return '';
  }

  ensureCoversDir();

  const hash = crypto
    .createHash('md5')
    .update(filePath + Date.now().toString())
    .digest('hex');

  const ext = cover.format ? cover.format.split('/')[1] || 'jpg' : 'jpg';
  const coverFileName = `${hash}.${ext}`;
  const coverFilePath = path.join(COVERS_DIR, coverFileName);

  const buffer = Buffer.isBuffer(cover.data)
    ? cover.data
    : Buffer.from(cover.data);

  fs.writeFileSync(coverFilePath, buffer);

  return coverFilePath;
}

export const metadataService = {
  async extract(filePath: string): Promise<ExtractedMetadata> {
    const defaults: ExtractedMetadata = {
      title: path.basename(filePath, path.extname(filePath)),
      artist: '',
      album: '',
      duration: 0,
      bitrate: 0,
      sampleRate: 0,
      format: path.extname(filePath).replace('.', '').toLowerCase(),
      fileSize: 0,
      coverPath: '',
    };

    try {
      const stat = fs.statSync(filePath);
      defaults.fileSize = stat.size;
    } catch {
      defaults.fileSize = 0;
    }

    try {
      const metadata = await parseFile(filePath);
      const common = metadata.common;
      const format = metadata.format;

      const cover = common.picture && common.picture.length > 0 ? common.picture[0] : null;
      const coverPath = await saveCover(filePath, cover);

      return {
        title: common.title || defaults.title,
        artist: common.artist || '',
        album: common.album || '',
        duration: format.duration || 0,
        bitrate: format.bitrate ? Math.round(format.bitrate / 1000) : 0,
        sampleRate: format.sampleRate || 0,
        format: format.container
          ? format.container.replace(/^.*\//, '').toLowerCase()
          : defaults.format,
        fileSize: defaults.fileSize,
        coverPath,
      };
    } catch (err) {
      console.error(`Failed to extract metadata from ${filePath}:`, err);
      return defaults;
    }
  },
};
