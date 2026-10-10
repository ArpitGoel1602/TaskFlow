import { Router } from 'express';
import {
  getTaskComments,
  createComment,
} from '../controllers/comment.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.route('/tasks/:taskId/comments')
  .get(getTaskComments)
  .post(createComment);

export default router;