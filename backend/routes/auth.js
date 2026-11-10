import { Router } from 'express';
import {
  registerProvider, loginProvider, requestCustomerOTP, verifyCustomerOTP, me,
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.post('/provider/register', registerProvider);
router.post('/provider/login', loginProvider);
router.post('/customer/otp/request', requestCustomerOTP);
router.post('/customer/otp/verify', verifyCustomerOTP);
router.get('/me', requireAuth, me);
export default router;