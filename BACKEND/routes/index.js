
import { Router } from 'express';

import authRoutes from './auth.route.js';
import projectRoutes from './project.route.js';
import taskRoutes from './task.route.js';
import commentRoutes from './comment.route.js';
import dashboardRoutes from './dashboard.route.js';
import userRoutes from './user.route.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/', taskRoutes);
router.use('/', commentRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/users', userRoutes);

export default router;