import { Router } from "express";
import { body } from "express-validator";
import { cancelPeriod, updatePeriod, getTodayPeriod, addTodayPeriod } from "../controllers/todayPeriod.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post('/getPeriods',[
    body("branch").isString().notEmpty().isLength({min:2},{max:3}).withMessage("Branch must be 2-3 characters long"),
    body("sem").isInt({min:1, max:8}).withMessage("Semester is required"),
],getTodayPeriod)

router.post('/updatePeriod',[
    body("periodName").isString().notEmpty().withMessage("Period Name is required"),
    body("teacherName").isString().notEmpty().withMessage("Teacher Name is required"),
    body("roomNo").isString().notEmpty().withMessage("Room No is required"),
    body('sem').isInt({min:1, max:8}).withMessage("Semester is required"),
    body("branch").isString().notEmpty().isLength({min:2},{max:3}).withMessage("Branch must be 2-3 characters long"),
    body('startTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Start time must be in HH:mm format'),
    body('endTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('End time must be in HH:mm format'),
    body("updatedBy").isString().notEmpty().withMessage("Updated by is required"),
],verifyJWT,updatePeriod)

router.post('/cancelPeriod',[
    body("id").isString().notEmpty().withMessage("Id is required"),
    body("updatedBy").isString().notEmpty().withMessage("Updated by is required"),
],verifyJWT,cancelPeriod)

router.post('/addTodayPeriod',[
    body("periodName").isString().notEmpty().withMessage("Period Name is required"),
    body("teacherName").isString().notEmpty().withMessage("Teacher Name is required"),
    body("roomNo").isString().notEmpty().withMessage("Room No is required"),
    body('startTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Start time must be in HH:mm format'),
    body('endTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('End time must be in HH:mm format'),
    body("branch").isString().notEmpty().isLength({min:2},{max:3}).withMessage("Branch must be 2-3 characters long"),
    body("batch").isString().notEmpty().isLength({  min: 2 }).withMessage("Batch must be 2-3 characters long"),
    body("sem").isInt({min:1, max:8}).withMessage("Semester is required"),
],verifyJWT,addTodayPeriod)


export default router;