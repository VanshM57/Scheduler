import { Router } from "express";
import { getActiveNotifications } from "../controllers/notification.controller.js";
import { verifyJWTStudent } from "../middlewares/studentAuth.middleware.js";

const router = Router();

// Get active notifications (for students and teachers)
router.get('/active', verifyJWTStudent, getActiveNotifications);

export default router;

