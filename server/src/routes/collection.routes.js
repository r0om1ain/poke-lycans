import { Router } from 'express';
import { collectionController } from '../controllers/collectionController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', collectionController.list);
router.post('/', collectionController.create);
router.get('/progress', collectionController.progress);
router.get('/value', collectionController.totalValue);
router.patch('/:id', collectionController.update);
router.delete('/:id', collectionController.remove);
router.get('/:id/estimate', collectionController.estimatedValue);
router.post('/:id/sell', collectionController.sell);

export default router;
