import { Router } from 'express';
import { catalogController } from '../controllers/catalogController.js';

const router = Router();

router.get('/home', catalogController.home);
router.get('/search', catalogController.search);
router.get('/products-by-ids', catalogController.byIds);
router.get('/products/:id', catalogController.productDetail);
router.get('/products-by-slug/:seriesCode/:slug', catalogController.productDetailBySlug);
router.get('/series', catalogController.series);
router.get('/categories', catalogController.categories);
router.get('/languages', catalogController.languages);
router.get('/grading-companies', catalogController.gradingCompanies);
router.get('/rarities', catalogController.rarities);

export default router;
