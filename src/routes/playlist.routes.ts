import { Router } from 'express';
import * as playlistController from '../controllers/playlist.controller';

const router = Router();

router.get('/', playlistController.getPlaylists);
router.get('/:id', playlistController.getPlaylistById);
router.post('/', playlistController.createPlaylist);
router.put('/:id', playlistController.updatePlaylist);
router.delete('/:id', playlistController.deletePlaylist);
router.post('/:id/songs', playlistController.addSong);
router.delete('/:id/songs/:songId', playlistController.removeSong);
router.put('/:id/songs/reorder', playlistController.reorderSongs);

export default router;
