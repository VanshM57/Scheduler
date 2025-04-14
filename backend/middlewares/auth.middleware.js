import jwt from 'jsonwebtoken'
import {asyncHandler} from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import BlacklistTokenModel from '../models/blacklistToken.model.js';

export const verifyJWT = asyncHandler(async (req,_,next)=>{
    try{
        const token = await req.cookies?.token || req.header("Authorization")?.replace("Bearer ","");
        if(!token){
            throw new ApiError(401,"Unauthorized request");
        }
        const isTokenBlacklisted = await BlacklistTokenModel.findOne({token: token});
        if(isTokenBlacklisted){
            throw new ApiError(401,"Unauthorized request");
        }
        
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select("-password")

        if(!user){
            throw new ApiError(401,"Invalid access token")
        }
        if(user.role === "student"){
            throw new ApiError(403,"Access denied")
        }

        req.user = user;
        next()
    }catch(err){
        throw new ApiError(401,err || "Invalid access token");
    }
})