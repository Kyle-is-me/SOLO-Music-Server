import * as fs from 'fs';
import * as path from 'path';
import { metadataService } from './metadata.service';
import { songRepository } from '../repositories/song.repository';
import { artistRepository } from '../repositories/artist.repository';
import { albumRepository } from '../repositories/album.repository';

const AUDIO_EXTENSIONS = new Set(['.mp3', '.flac', '.wav', '.ogg', '.aac', '.m4a']);

interface ScanResult {
  total: number;
  added: number;
  skipped: number;
  errors: number;
}

function getAudioFiles(dirPath: string): string[] {
  const results: string[] = [];

  function walk(currentPath: string) {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(currentPath, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (AUDIO_EXTENSIONS.has(ext)) {
          results.push(fullPath);
        }
      }
    }
  }

  walk(dirPath);
  return results;
}

export const libraryService = {
  async scan(dirPath: string): Promise<ScanResult> {
    const result: ScanResult = {
      total: 0,
      added: 0,
      skipped: 0,
      errors: 0,
    };

    const files = getAudioFiles(dirPath);
    result.total = files.length;

    for (const filePath of files) {
      try {
        const existing = await songRepository.findByFilePath(filePath);
        if (existing) {
          result.skipped++;
          continue;
        }

        const metadata = await metadataService.extract(filePath);

        let artistId: number | undefined;
        if (metadata.artist) {
          const artist = await artistRepository.findOrCreate(metadata.artist);
          artistId = artist.id;
        }

        let albumId: number | undefined;
        if (metadata.album) {
          const album = await albumRepository.findOrCreate(metadata.album, artistId);
          albumId = album.id;
        }

        await songRepository.create({
          title: metadata.title,
          filePath,
          duration: metadata.duration,
          bitrate: metadata.bitrate,
          sampleRate: metadata.sampleRate,
          format: metadata.format,
          fileSize: metadata.fileSize,
          coverPath: metadata.coverPath,
          albumId,
          artistId,
        });

        result.added++;
      } catch (err) {
        console.error(`Error processing file ${filePath}:`, err);
        result.errors++;
      }
    }

    return result;
  },
};
