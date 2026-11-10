import { Router } from 'express';
import {
  stats, listAllProviders, toggleProviderStatus, listAllRequests, activityLog,
} from '../controllers/adminController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requireRole('admin','security_admin'));
router.get('/stats', stats);
router.get('/providers', listAllProviders);
router.put('/providers/:id/status', toggleProviderStatus);
router.get('/requests', listAllRequests);
router.get('/activity', activityLog);
export default router;