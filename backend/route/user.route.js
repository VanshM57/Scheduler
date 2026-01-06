import { Router } from "express";
import { loginUser, registerUser, logoutUser, getUser, updateProfile } from "../controllers/user.controller.js";
import { verifyJWTStudent } from "../middlewares/studentAuth.middleware.js";
const router = Router();
import { body } from "express-validator";

router.post('/register',[
    body('email').isEmail().withMessage('Invalid Email'),
    body('password').isLength({min: 6}).withMessage('Passoword must be at least 6 character long'),
], registerUser)

router.post('/login',[
    body('email').isEmail().withMessage('Invalid Email'),
    body('password').isLength({min: 6}).withMessage('Password must be at least 6 character')
], loginUser)

router.get('/logout',logoutUser)

router.get('/getUser',getUser)

router.post('/updateProfile',[
    body('password').optional().isLength({min: 6}).withMessage('Password must be at least 6 characters'),
    body('branch').optional().isString().withMessage('Branch must be a string'),
    body('sem').optional().isInt({min: 1, max: 8}).withMessage('Semester must be between 1 and 8'),
], verifyJWTStudent, updateProfile)

export default router;