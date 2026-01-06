import { Router } from "express";
import { body } from "express-validator";
import { verifyAdmin } from "../middlewares/adminAuth.middleware.js";
import {
    // User Management
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    // Period Management
    getAllOriginalPeriods,
    getAllTodayPeriods,
    createOriginalPeriod,
    updateOriginalPeriodAdmin,
    deleteOriginalPeriodAdmin,
    // Event Management
    getAllSpecialEvents,
    createSpecialEventAdmin,
    updateSpecialEventAdmin,
    deleteSpecialEventAdmin,
    // Notification Management
    getAllNotifications,
    createNotification,
    updateNotification,
    deleteNotification,
    // Dashboard
    getDashboardStats
} from "../controllers/admin.controller.js";

const router = Router();

// All admin routes require admin authentication
router.use(verifyAdmin);

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// User Management
router.get('/users', getAllUsers);
router.post('/users/create', [
    body('name').isString().notEmpty().withMessage("Name is required"),
    body('email').isEmail().withMessage("Invalid email"),
    body('password').isLength({min: 6}).withMessage("Password must be at least 6 characters"),
    body('role').isIn(['student', 'teacher']).withMessage("Role must be student or teacher"),
], createUser);
router.post('/users/update', [
    body('id').isString().notEmpty().withMessage("User ID is required"),
], updateUser);
router.post('/users/delete', [
    body('id').isString().notEmpty().withMessage("User ID is required"),
], deleteUser);

// Period Management
router.get('/periods/original', getAllOriginalPeriods);
router.get('/periods/today', getAllTodayPeriods);
router.post('/periods/create', [
    body('periodName').isString().notEmpty().withMessage("Period name is required"),
    body('teacherName').isString().notEmpty().withMessage("Teacher name is required"),
    body('roomNo').isString().notEmpty().withMessage("Room number is required"),
    body('startTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Start time must be in HH:mm format'),
    body('endTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('End time must be in HH:mm format'),
    body('branch').isString().notEmpty().withMessage("Branch is required"),
    body('sem').isInt({min:1, max:8}).withMessage("Semester must be between 1 and 8"),
    body('day').isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']).withMessage("Invalid day"),
], createOriginalPeriod);
router.post('/periods/update', [
    body('id').isString().notEmpty().withMessage("Period ID is required"),
], updateOriginalPeriodAdmin);
router.post('/periods/delete', [
    body('id').isString().notEmpty().withMessage("Period ID is required"),
], deleteOriginalPeriodAdmin);

// Special Event Management
router.get('/events', getAllSpecialEvents);
router.post('/events/create', [
    body('eventName').isString().notEmpty().withMessage("Event name is required"),
    body('date').isISO8601().withMessage("Date must be a valid date"),
    body('startTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Start time must be in HH:mm format'),
    body('endTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('End time must be in HH:mm format'),
], createSpecialEventAdmin);
router.post('/events/update', [
    body('id').isString().notEmpty().withMessage("Event ID is required"),
], updateSpecialEventAdmin);
router.post('/events/delete', [
    body('id').isString().notEmpty().withMessage("Event ID is required"),
], deleteSpecialEventAdmin);

// Notification Management
router.get('/notifications', getAllNotifications);
router.post('/notifications/create', [
    body('title').isString().notEmpty().withMessage("Title is required"),
    body('description').isString().notEmpty().withMessage("Description is required"),
    body('startDate').isISO8601().withMessage("Start date must be a valid date"),
    body('endDate').isISO8601().withMessage("End date must be a valid date"),
], createNotification);
router.post('/notifications/update', [
    body('id').isString().notEmpty().withMessage("Notification ID is required"),
], updateNotification);
router.post('/notifications/delete', [
    body('id').isString().notEmpty().withMessage("Notification ID is required"),
], deleteNotification);

export default router;

