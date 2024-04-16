import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken"

const verifyJwt = asyncHandler(async(req, res, next)=>{
    try {
        const token = req.cookies?.accessToken
        
        if(!token){
            throw new ApiError(401, "Unauthorized request")
        }

        const decodeToken = jwt.decode(token, process.env.ACCESS_SECRET_TOKEN_KEY)

        const user = await User.findById(decodeToken?._id).select("-password -refreshToken")

        if(!user){
            throw new ApiError(401, "invalid access")
        }

        req.user = user;
        next()

    } catch (error) {
        throw new ApiError(401, error?.message)
    }
})

export {verifyJwt}