import { Router } from 'express';
import {
  getMyTasks,
  getProjectTasks,
  createTask,
  getTaskById,
  updateTask,
} from '../controllers/task.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.route('/tasks').get(getMyTasks);

router.route('/projects/:projectId/tasks')
  .get(getProjectTasks)
  .post(createTask);

router.route('/tasks/:id')
  .get(getTaskById)
  .put(updateTask);

export default router;