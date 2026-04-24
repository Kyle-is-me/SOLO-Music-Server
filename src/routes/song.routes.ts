import { Router } from 'express';
import { songController } from '../controllers/song.controller';

const router = Router();

router.get('/', songController.getSongs);
router.get('/:id', songController.getSongById);
router.delete('/:id', songController.deleteSong);

export default router;
