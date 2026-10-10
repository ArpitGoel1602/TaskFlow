import { Router } from "express";
const router = Router();

import { getDashboard } from "../controllers/dashboard.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

router.get("/", authMiddleware, getDashboard);

export default router;