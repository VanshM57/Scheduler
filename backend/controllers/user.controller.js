import { asyncHandler } from "../utils/asyncHandler.js";
import { validationResult } from "express-validator";
import { User } from "../models/user.model.js";
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import BlacklistTokenModel from "../models/blacklistToken.model.js";

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
    const {name, rollno, email, branch, password,sem, college} = req.body;
    
    // if ([name, rollno, email, college, password, branch, sem].some(field => !field || field.trim() === "")) {
    //     throw new ApiError(400, "All fields are required");
    // }

    if(!name || !rollno || !email || !branch || !password || !sem || !college){
        throw new ApiError(400,"All fields are required");
    }
    

    //checking existed user present or not
    const exitedUser = await User.findOne({
        $or: [{email, rollno}]
    })

    if(exitedUser){
        throw new ApiError(409, "User with this email or rollno already existed")
    }

    const user = await User.create({
        name: name,
        email: email,
        password: password,
        rollno: rollno,
        branch: branch,
        sem: sem,
        college: college
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
        secure: true
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
        res.status(400).json({ errors: errors.array() })
    }

    const {email, password} = req.body;
    
    //checking fields
    if(!email && !password){
        throw new ApiError(400,"email or password is required")
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
        secure: true
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
        secure: true
    }
    const token = await req.cookies?.token || req.headers.authorization?.split(' ')[1];
    await BlacklistTokenModel.create({ token });
    console.log("User logged out");
    return res.
    status(200)
    .clearCookie("token",options)
    .json(new ApiResponse(200, {},"User logged out"))
})

export {loginUser, registerUser, logoutUser}