import { Router } from 'express';
import { listingController } from '../controllers/listingController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/product/:productId', listingController.forProduct);
router.get('/mine', requireAuth, listingController.mine);
router.get('/mine/facets', requireAuth, listingController.myFacets);
router.post('/', requireAuth, listingController.create);
router.patch('/:id', requireAuth, listingController.update);
router.delete('/:id', requireAuth, listingController.remove);

export default router;
