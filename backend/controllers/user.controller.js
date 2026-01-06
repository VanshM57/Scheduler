import { asyncHandler } from "../utils/asyncHandler.js";
import { validationResult } from "express-validator";
import { User } from "../models/user.model.js";
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import BlacklistTokenModel from "../models/blacklistToken.model.js";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

//to generate access Token
const generateToken = async (userId)=>{
    try{
        const user = await User.findById(userId);
        const token = user.generateAccessToken();
        return token;
    }catch (error){
        throw new ApiError(500, error?.message || "Something went wrong while generating access token")
    }
}

//for register user
const registerUser = asyncHandler(async(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() })
    }
    const {name, email, password} = req.body;
    
    if(!name || !email || !password){
        throw new ApiError(400,"Name, email, and password are required");
    }

    // Validate email domain
    if(!email.endsWith('@rtu.ac.in')){
        throw new ApiError(400, "Email must be from @rtu.ac.in domain");
    }
    

    //checking existed user present or not
    const exitedUser = await User.findOne({ email })

    if(exitedUser){
        throw new ApiError(409, "User with this email already exists")
    }

    const user = await User.create({
        name: name,
        email: email,
        password: password,
        role: 'student' // Default role is student
    })

    const createdUser = await User.findById(user._id).select("-password");

    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
    }
    const token = await generateToken(createdUser._id);

    const loginUser = await User.findById(user._id).select("-password");
    //setting options
    const options= {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    }
    console.log("User created and logged in successfully");

    return res
    .status(201)
    .cookie("token",token,options)
    .json(
        new ApiResponse(
            201,
            {
                user: loginUser, token
            },
            "User created and logged in successfully"
        )
    )
})

//login user
const loginUser = asyncHandler(async (req,res)=>{

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() })
    }

    const {email, password} = req.body;
    
    //checking fields
    if(!email || !password){
        throw new ApiError(400,"Email and password are required")
    }

    // Validate email domain
    if(!email.endsWith('@rtu.ac.in')){
        throw new ApiError(400, "Email must be from @rtu.ac.in domain");
    }
    
    //finding user
    const user = await User.findOne({email: email});
    //throw error if user not exists
    if(!user){
        throw new ApiError(404, "User does not exist, incorrect email")
    }
    //password validation
    const isPasswordValid = await user.isPasswordCorrect(password);
    //throw error if password is not valid
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    //generate accesstoken
    const token = await generateToken(user._id);

    //finding login user
    const loginUser = await User.findById(user._id).select("-password");
    //setting options
    const options= {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    }
    console.log("User logged in successfully");

    return res
    .status(200)
    .cookie("token",token,options)
    .json(
        new ApiResponse(
            200,
            {
                user: loginUser, token
            },
            "User logged in successfully"
        )
    )
})

//logout user
const logoutUser = asyncHandler(async(req,res)=>{
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    }
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    await BlacklistTokenModel.create({ token });
    console.log("User logged out");
    return res.
    status(200)
    .clearCookie("token",options)
    .json(new ApiResponse(200, {},"User logged out"))
})

const getUser = asyncHandler(async(req,res)=>{
    const token = req.cookies?.token || req.headers.authorization?.replace("Bearer ", "") || req.headers.authorization?.split(' ')[1];
    if(!token){
        throw new ApiError(401,"Not authenticated. Please login again")
    }

    //check token is blacklisted or not
    const isBlacklisted = await BlacklistTokenModel.findOne({ token });
    if (isBlacklisted) {
        throw new ApiError(401, "Token is blacklisted. Please login again.");
    }

    // Check if ACCESS_TOKEN_SECRET is set
    if(!process.env.ACCESS_TOKEN_SECRET){
        throw new ApiError(500, "Server configuration error: ACCESS_TOKEN_SECRET not set");
    }

    //decode the token
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (error) {
        if(error.name === 'JsonWebTokenError'){
            throw new ApiError(401, "Invalid token. Please login again.");
        } else if(error.name === 'TokenExpiredError'){
            throw new ApiError(401, "Token expired. Please login again.");
        } else {
            throw new ApiError(401, "Token verification failed. Please login again.");
        }
    }

    //find the user
    const user = await User.findById(decodedToken?._id).select("-password")

    //check user present or not
    if(!user){
        throw new ApiError(401,"User not exist, Please login again.")
    }

    //send the user
    return res
    .status(200)
    .json(new ApiResponse(200,user,"User fetched successfully"));
})

// Update user profile (self)
const updateProfile = asyncHandler(async(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }

    const { branch, sem, password } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if(!user){
        throw new ApiError(404, "User not found");
    }

    const updateData = {};
    
    // Only students can update branch and sem
    if(user.role === 'student'){
        if(branch !== undefined) {
            updateData.branch = branch.toLowerCase();
        }
        if(sem !== undefined) {
            const semNum = parseInt(sem);
            if(semNum < 1 || semNum > 8){
                throw new ApiError(400, "Semester must be between 1 and 8");
            }
            updateData.sem = semNum;
        }
    }

    // Update password if provided
    if(password){
        if(password.length < 6){
            throw new ApiError(400, "Password must be at least 6 characters long");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        updateData.password = hashedPassword;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {new: true}).select("-password");

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            { user: updatedUser },
            "Profile updated successfully"
        )
    )
})

export {loginUser, registerUser, logoutUser, getUser, updateProfile}