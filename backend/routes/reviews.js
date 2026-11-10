import { Router } from 'express';
import { createReview } from '../controllers/reviewController.js';
import { requireCustomer } from '../middleware/auth.js';

const router = Router();
router.post('/', requireCustomer, createReview);
export default router;