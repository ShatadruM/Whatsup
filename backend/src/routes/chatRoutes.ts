import { Router } from 'express';
import { createOrFetchChat, getUserChats, removeFromGroup, createGroupChat, promoteToAdmin, addToGroup} from '../controllers/chatController';
import { protectRoute } from '../middleware/authMiddleware';

const router = Router();

// All chat routes should be protected
router.use(protectRoute);

router.post('/', createOrFetchChat);
router.get('/', getUserChats);
router.post('/group', protectRoute, createGroupChat);
router.put('/group/add', protectRoute, addToGroup);
router.put('/group/remove', protectRoute, removeFromGroup);
router.put('/group/promote', protectRoute, promoteToAdmin);

export default router;