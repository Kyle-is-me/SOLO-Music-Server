import { Request, Response } from 'express';
import { success } from '../utils/response';
import * as lyricsService from '../services/lyrics.service';

export const getLyrics = async (req: Request, res: Response) => {
  const songId = Number(req.params.id);
  const lyrics = await lyricsService.getLyrics(songId);
  res.json(success(lyrics));
};

export const updateLyrics = async (req: Request, res: Response) => {
  const songId = Number(req.params.id);
  const { content, offset } = req.body;
  const lyrics = await lyricsService.updateLyrics(songId, { content, offset });
  res.json(success(lyrics));
};
