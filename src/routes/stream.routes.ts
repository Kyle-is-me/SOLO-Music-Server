import { Router } from 'express';
import { stream } from '../controllers/stream.controller';

const router = Router();

router.get('/:id/stream', stream);

export default router;
