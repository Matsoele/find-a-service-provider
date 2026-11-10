import { Router } from 'express';
import {
  startConversation, getMessages, sendMessage, providerConversations, customerConversations,
} from '../controllers/messageController.js';
import { requireAuth, requireRole, requireCustomer } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.post('/conversations/start', requireCustomer, startConversation);
router.get('/conversations/customer', requireCustomer, customerConversations);
router.get('/conversations/provider', requireAuth, requireRole('provider'), providerConversations);
router.get('/conversations/:conversationId/messages', getMessages);

// Send: try provider, else customer
const either = (req, res, next) => {
  if (req.headers.authorization) return requireAuth(req, res, next);
  return requireCustomer(req, res, next);
};
router.post('/messages', upload.single('image'), either, (req, res) => sendMessage(req, res));

export default router;