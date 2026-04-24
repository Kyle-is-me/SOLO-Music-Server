import { Router } from 'express';
import * as playHistoryController from '../controllers/playHistory.controller';

const router = Router();

router.get('/', playHistoryController.getHistory);
router.post('/:songId', playHistoryController.recordPlay);

export default router;
