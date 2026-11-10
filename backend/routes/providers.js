import { Router } from 'express';
import {
  listProviders, getProviderById, getMyProvider, updateMyProfile, uploadProfileImage,
  listMyServices, addService, updateService, deleteService,
} from '../controllers/providerController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();
router.get('/', listProviders);
router.get('/me', requireAuth, requireRole('provider'), getMyProvider);
router.put('/me', requireAuth, requireRole('provider'), updateMyProfile);
router.post('/me/image', requireAuth, requireRole('provider'), upload.single('image'), uploadProfileImage);
router.get('/me/services', requireAuth, requireRole('provider'), listMyServices);
router.post('/me/services', requireAuth, requireRole('provider'), addService);
router.put('/me/services/:id', requireAuth, requireRole('provider'), updateService);
router.delete('/me/services/:id', requireAuth, requireRole('provider'), deleteService);
router.get('/:id', getProviderById);
export default router;