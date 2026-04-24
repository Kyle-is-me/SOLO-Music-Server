import { Router } from 'express';
import { getLyrics, updateLyrics } from '../controllers/lyrics.controller';

const router = Router();

router.get('/:id/lyrics', getLyrics);
router.put('/:id/lyrics', updateLyrics);

export default router;
