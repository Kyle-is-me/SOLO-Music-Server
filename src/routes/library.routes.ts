import { Router } from 'express';
import { libraryController } from '../controllers/library.controller';

const router = Router();

router.post('/scan', libraryController.scan);

export default router;
