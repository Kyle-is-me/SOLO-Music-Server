import { Request, Response } from 'express';
import * as favoriteService from '../services/favorite.service';
import { success } from '../utils/response';

export const getFavorites = async (req: Request, res: Response) => {
  const page = req.query.page ? Number(req.query.page) : undefined;
  const pageSize = req.query.pageSize ? Number(req.query.pageSize) : undefined;
  const result = await favoriteService.getFavorites({ page, pageSize });
  res.json(success(result));
};

export const addFavorite = async (req: Request, res: Response) => {
  const songId = Number(req.params.songId);
  const result = await favoriteService.addFavorite(songId);
  res.status(201).json(success(result));
};

export const removeFavorite = async (req: Request, res: Response) => {
  const songId = Number(req.params.songId);
  const result = await favoriteService.removeFavorite(songId);
  res.json(success(result));
};
