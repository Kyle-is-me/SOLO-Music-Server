import { Router } from 'express';
import { artistController } from '../controllers/artist.controller';

const router = Router();

router.get('/', artistController.getArtists);
router.get('/:id', artistController.getArtistById);

export default router;
