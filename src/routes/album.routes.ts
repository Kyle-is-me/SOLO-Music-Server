import { Router } from 'express';
import { albumController } from '../controllers/album.controller';

const router = Router();

router.get('/', albumController.getAlbums);
router.get('/:id', albumController.getAlbumById);

export default router;
