import { Router } from "express";


import { loginUser,registerUser,logoutUser,getUser } from "../controllers/user.controller.js";
const router = Router();
import { body } from "express-validator";
router.post('/register',[
    body('email').isEmail().withMessage('Invalid Email'),
    body('password').isLength({min: 6}).withMessage('Passoword must be at least 6 character long'),
    body('branch').isLength({min:2},{max:3}).withMessage('Branch must be 2-3 characters long'),
    body("sem").isInt({min:1, max:8}).withMessage("Semester is required"),
], registerUser)

router.post('/login',[
    body('email').isEmail().withMessage('Invalid Email'),
    body('password').isLength({min: 6}).withMessage('Password must be at least 6 character')
], loginUser)

router.get('/logout',logoutUser)

router.get('/getUser',getUser)


export default router;