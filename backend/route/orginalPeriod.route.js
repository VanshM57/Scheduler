import { Router } from "express";
import { body } from "express-validator";
import { addPeriod, deleteOriginalPeriod, updateOriginalPeriod } from "../controllers/originalPeriod.controller.js";
import { originalPeriodAuth } from "../middlewares/originalPeriodAuth.middleware.js";


const router = Router();

const allowDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

router.post('/add-original-period',[
    body("id").isString().notEmpty().withMessage("Id is required"),
    body("periodName").isString().notEmpty().withMessage("Period Name is required"),
    body("teacherName").isString().notEmpty().withMessage("Teacher Name is required"),
    body("roomNo").isString().notEmpty().withMessage("Room No is required"),
    body('startTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Start time must be in HH:mm format'),
    body('endTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('End time must be in HH:mm format'),
    body("branch").isString().notEmpty().isLength({min:2},{max:3}).withMessage("Branch must be 2-3 characters long"),
    body("batch").isString().notEmpty().isLength({  min: 2 }).withMessage("Batch must be 2-3 characters long"),
    body("sem").isInt({min:1, max:8}).withMessage("Semester is required"),
    body("day").isString().isIn(allowDays).withMessage(`Day must be one of the following: ${allowDays.join(", ")}`),
],originalPeriodAuth,addPeriod)

router.post('/update-original-period',[
    body("id").isString().notEmpty().withMessage("Id is required"),
    body("periodName").isString().notEmpty().withMessage("Period Name is required"),
    body("teacherName").isString().notEmpty().withMessage("Teacher Name is required"),
    body("roomNo").isString().notEmpty().withMessage("Room No is required"),
    body('startTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Start time must be in HH:mm format'),
    body('endTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('End time must be in HH:mm format'),
    body("branch").isString().notEmpty().isLength({min:2},{max:3}).withMessage("Branch must be 2-3 characters long"),
    body("batch").isString().notEmpty().isLength({  min: 2 }).withMessage("Batch must be 2-3 characters long"),
    body("sem").isInt({min:1, max:8}).withMessage("Semester is required"),
    body("day").isString().isIn(allowDays).withMessage(`Day must be one of the following: ${allowDays.join(", ")}`),
],originalPeriodAuth,updateOriginalPeriod)

router.delete('/delete-original-period',originalPeriodAuth,deleteOriginalPeriod)

export default router;