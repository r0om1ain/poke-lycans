import { Router } from 'express';
import { messageController } from '../controllers/messageController.js';
import { requireAuth } from '../middleware/auth.js';
import { uploadMessageImage } from '../middleware/upload.js';

const router = Router();
router.use(requireAuth);

router.get('/conversations', messageController.conversations);
router.post('/contact', messageController.contact);
router.get('/conversations/:id/messages', messageController.messages);
router.post('/conversations/:id/messages', messageController.sendText);
router.post('/conversations/:id/images', uploadMessageImage.single('image'), messageController.sendImage);
router.post('/conversations/:id/offers', messageController.makeOffer);
router.post('/offers/:offerId/respond', messageController.respondOffer);

export default router;
