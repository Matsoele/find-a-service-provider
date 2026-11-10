import { Router } from 'express';
import {
  createRequest, trackRequest, myProviderRequests, updateRequestStatus,
} from '../controllers/requestController.js';
import { requireAuth, requireRole, requireCustomer } from '../middleware/auth.js';

const router = Router();
router.post('/', requireCustomer, createRequest);
router.post('/track', trackRequest);
router.get('/provider/mine', requireAuth, requireRole('provider'), myProviderRequests);
router.put('/:id/status', requireAuth, requireRole('provider'), updateRequestStatus);
export default router;