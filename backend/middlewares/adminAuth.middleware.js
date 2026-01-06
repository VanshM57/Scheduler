import jwt from 'jsonwebtoken'
import {asyncHandler} from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import BlacklistTokenModel from '../models/blacklistToken.model.js';

// Middleware that only allows admin users
export const verifyAdmin = asyncHandler(async (req,_,next)=>{
    try{
        const token = req.cookies?.token || req.header("Authorization")?.replace("Bearer ","");
        if(!token){
            throw new ApiError(401,"Unauthorized request");
        }
        const isTokenBlacklisted = await BlacklistTokenModel.findOne({token: token});
        if(isTokenBlacklisted){
            throw new ApiError(401,"Unauthorized request");
        }
        
        // Check if ACCESS_TOKEN_SECRET is set
        if(!process.env.ACCESS_TOKEN_SECRET){
            throw new ApiError(500, "Server configuration error: ACCESS_TOKEN_SECRET not set");
        }

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

        const user = await User.findById(decodedToken?._id).select("-password")

        if(!user){
            throw new ApiError(401,"Invalid access token")
        }

        // Check if user is admin (only isAdmin flag, role can be teacher)
        if(!user.isAdmin){
            throw new ApiError(403,"Access denied. Admin privileges required.")
        }

        req.user = user;
        next()
    }catch(err){
        if(err instanceof ApiError){
            throw err;
        }
        throw new ApiError(401, err?.message || "Invalid access token");
    }
})

