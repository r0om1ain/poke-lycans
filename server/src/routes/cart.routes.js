import { Router } from 'express';
import { cartController } from '../controllers/cartController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', cartController.get);
router.post('/items', cartController.add);
router.patch('/items/:id', cartController.updateQuantity);
router.delete('/items/:id', cartController.remove);

export default router;
