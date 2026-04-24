import { Request, Response } from 'express';
import * as playlistService from '../services/playlist.service';
import { success } from '../utils/response';

export const getPlaylists = async (_req: Request, res: Response) => {
  const playlists = await playlistService.getPlaylists();
  res.json(success(playlists));
};

export const getPlaylistById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const playlist = await playlistService.getPlaylistById(id);
  res.json(success(playlist));
};

export const createPlaylist = async (req: Request, res: Response) => {
  const { name, description, coverPath } = req.body;
  const playlist = await playlistService.createPlaylist({ name, description, coverPath });
  res.status(201).json(success(playlist));
};

export const updatePlaylist = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { name, description, coverPath } = req.body;
  const playlist = await playlistService.updatePlaylist(id, { name, description, coverPath });
  res.json(success(playlist));
};

export const deletePlaylist = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await playlistService.deletePlaylist(id);
  res.json(success(null));
};

export const addSong = async (req: Request, res: Response) => {
  const playlistId = Number(req.params.id);
  const { songId } = req.body;
  const playlistSong = await playlistService.addSongToPlaylist(playlistId, songId);
  res.status(201).json(success(playlistSong));
};

export const removeSong = async (req: Request, res: Response) => {
  const playlistId = Number(req.params.id);
  const songId = Number(req.params.songId);
  await playlistService.removeSongFromPlaylist(playlistId, songId);
  res.json(success(null));
};

export const reorderSongs = async (req: Request, res: Response) => {
  const playlistId = Number(req.params.id);
  const { songs } = req.body;
  const result = await playlistService.reorderPlaylistSongs(playlistId, songs);
  res.json(success(result));
};
