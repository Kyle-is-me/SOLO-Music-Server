import { Router } from 'express';
import { success } from '../utils/response';
import songRoutes from './song.routes';
import libraryRoutes from './library.routes';
import albumRoutes from './album.routes';
import artistRoutes from './artist.routes';
import playlistRoutes from './playlist.routes';
import favoriteRoutes from './favorite.routes';
import playHistoryRoutes from './playHistory.routes';
import lyricsRoutes from './lyrics.routes';
import streamRoutes from './stream.routes';
import searchRoutes from './search.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json(success({ status: 'ok' }));
});

router.use('/songs', songRoutes);
router.use('/songs', lyricsRoutes);
router.use('/songs', streamRoutes);
router.use('/library', libraryRoutes);
router.use('/albums', albumRoutes);
router.use('/artists', artistRoutes);
router.use('/playlists', playlistRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/history', playHistoryRoutes);
router.use('/search', searchRoutes);

export default router;
