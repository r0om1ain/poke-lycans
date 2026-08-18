import { Router } from 'express';
import { accountController } from '../controllers/accountController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.patch('/profile', accountController.updateProfile);

router.get('/addresses', accountController.listAddresses);
router.post('/addresses', accountController.createAddress);
router.patch('/addresses/:id', accountController.updateAddress);
router.delete('/addresses/:id', accountController.removeAddress);

router.get('/payment-methods', accountController.listPaymentMethods);
router.post('/payment-methods', accountController.createPaymentMethod);
router.delete('/payment-methods/:id', accountController.removePaymentMethod);

router.get('/shipping-methods', accountController.listShippingMethods);
router.post('/shipping-methods', accountController.createShippingMethod);
router.patch('/shipping-methods/:id', accountController.updateShippingMethod);
router.delete('/shipping-methods/:id', accountController.removeShippingMethod);

export default router;
