import { Router } from 'express';
import { protect } from '../middleware/auth';
import { getConversations, getMessages, sendMessage, markAsRead, deleteMessage } from '../controllers/message.controller';

const router = Router();

router.use(protect);
router.get('/conversations', getConversations);
router.get('/:conversationId', getMessages);
router.post('/send', sendMessage);
router.put('/read', markAsRead);
router.delete('/message/:id', deleteMessage);

export default router;
