import * as playlistRepo from '../repositories/playlist.repository';
import * as playlistSongRepo from '../repositories/playlistSong.repository';
import { AppError } from '../middlewares/errorHandler';

export const getPlaylists = async () => {
  return playlistRepo.findAll();
};

export const getPlaylistById = async (id: number) => {
  const playlist = await playlistRepo.findById(id);
  if (!playlist) {
    throw new AppError(404, 404, 'Playlist not found');
  }
  return playlist;
};

export const createPlaylist = async (data: { name: string; description?: string; coverPath?: string }) => {
  return playlistRepo.create(data);
};

export const updatePlaylist = async (id: number, data: { name?: string; description?: string; coverPath?: string }) => {
  const playlist = await playlistRepo.findById(id);
  if (!playlist) {
    throw new AppError(404, 404, 'Playlist not found');
  }
  return playlistRepo.update(id, data);
};

export const deletePlaylist = async (id: number) => {
  const playlist = await playlistRepo.findById(id);
  if (!playlist) {
    throw new AppError(404, 404, 'Playlist not found');
  }
  return playlistRepo.remove(id);
};

export const addSongToPlaylist = async (playlistId: number, songId: number) => {
  const playlist = await playlistRepo.findById(playlistId);
  if (!playlist) {
    throw new AppError(404, 404, 'Playlist not found');
  }

  const existing = await playlistSongRepo.findByPlaylistAndSong(playlistId, songId);
  if (existing) {
    throw new AppError(409, 409, 'Song already in playlist');
  }

  return playlistSongRepo.addSong(playlistId, songId);
};

export const removeSongFromPlaylist = async (playlistId: number, songId: number) => {
  const existing = await playlistSongRepo.findByPlaylistAndSong(playlistId, songId);
  if (!existing) {
    throw new AppError(404, 404, 'Song not found in playlist');
  }
  return playlistSongRepo.removeSong(playlistId, songId);
};

export const reorderPlaylistSongs = async (playlistId: number, songOrders: { songId: number; order: number }[]) => {
  const playlist = await playlistRepo.findById(playlistId);
  if (!playlist) {
    throw new AppError(404, 404, 'Playlist not found');
  }
  return playlistSongRepo.reorder(playlistId, songOrders);
};
