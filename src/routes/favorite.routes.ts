import { Router } from 'express';
import * as favoriteController from '../controllers/favorite.controller';

const router = Router();

router.get('/', favoriteController.getFavorites);
router.post('/:songId', favoriteController.addFavorite);
router.delete('/:songId', favoriteController.removeFavorite);

export default router;
