import { Router } from 'express';
import { searchUsers } from '../controllers/userController';
import { protectRoute } from '../middleware/authMiddleware';

const router = Router();

// Protect this route so only logged-in users can search
router.get('/', protectRoute, searchUsers);

export default router;