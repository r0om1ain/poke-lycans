import { Router } from 'express';
import { auctionController } from '../controllers/auctionController.js';
import { requireAuth } from '../middleware/auth.js';
import { uploadAuctionPhotos } from '../middleware/upload.js';

const router = Router();

router.get('/', auctionController.list);
router.get('/mine/all', requireAuth, auctionController.mine);
router.get('/:id', auctionController.detail);
router.post('/', requireAuth, uploadAuctionPhotos.array('photos', 8), auctionController.create);
router.post('/:id/bids', requireAuth, auctionController.placeBid);
router.post('/:id/finalize', requireAuth, auctionController.finalizePurchase);

export default router;
