import { Router } from 'express';
import { sellerController } from '../controllers/sellerController.js';

const router = Router();

router.get('/:id', sellerController.profile);
router.get('/:id/listings', sellerController.listings);
router.get('/:id/reviews', sellerController.reviews);
router.get('/:id/shipping-methods', sellerController.shippingMethods);

export default router;
