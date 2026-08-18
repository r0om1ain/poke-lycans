import { Router } from 'express';
import { catalogController } from '../controllers/catalogController.js';

const router = Router();

router.get('/home', catalogController.home);
router.get('/search', catalogController.search);
router.get('/products/:id', catalogController.productDetail);
router.get('/series', catalogController.series);
router.get('/categories', catalogController.categories);
router.get('/languages', catalogController.languages);
router.get('/grading-companies', catalogController.gradingCompanies);

export default router;
