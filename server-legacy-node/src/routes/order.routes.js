import { Router } from 'express';
import { orderController } from '../controllers/orderController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.post('/checkout', orderController.checkout);
router.get('/purchases', orderController.purchases);
router.get('/sales', orderController.sales);
router.get('/:id', orderController.detail);
router.post('/:id/pay', orderController.pay);
router.post('/:id/ship', orderController.ship);
router.post('/:id/receive', orderController.receive);
router.post('/:id/review', orderController.review);

export default router;
