import { Router } from 'express';
import { getMessages, sendMessage, deleteMessage } from '../controllers/messageController';
import { protectRoute } from '../middleware/authMiddleware';

const router = Router();

router.use(protectRoute);

router.get('/:chatId', getMessages);
router.post('/', sendMessage);
router.delete('/:messageId', deleteMessage)

export default router;