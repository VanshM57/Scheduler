import { Router } from "express";
import { body } from "express-validator";
import { createSpecialEvent, getSpecialEvents, updateSpecialEvent, deleteSpecialEvent } from "../controllers/specialEvent.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyJWTStudent } from "../middlewares/studentAuth.middleware.js";

const router = Router();

router.post('/create',[
    body("eventName").isString().notEmpty().withMessage("Event name is required"),
    body("date").isISO8601().withMessage("Date must be a valid date"),
    body('startTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Start time must be in HH:mm format'),
    body('endTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('End time must be in HH:mm format'),
], verifyJWT, createSpecialEvent)

router.get('/getEvents', verifyJWTStudent, getSpecialEvents)

router.post('/update',[
    body("id").isString().notEmpty().withMessage("Event ID is required"),
], verifyJWT, updateSpecialEvent)

router.post('/delete',[
    body("id").isString().notEmpty().withMessage("Event ID is required"),
], verifyJWT, deleteSpecialEvent)

export default router;

