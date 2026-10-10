import { Router } from 'express';
import { searchUsers } from '../controllers/user.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/search', searchUsers);

export default router;
