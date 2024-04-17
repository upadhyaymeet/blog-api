import { asyncHandler } from "../utils/AsyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.model.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"

const generateAccessAndRefreshToken = async (userId)=>{
    try {
        const user = await User.findById(userId)
        
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false})

        return {refreshToken, accessToken}
    } catch (error) {
        throw new ApiError(500, "something went wrong while generating token")
    }
}

const registerUser = asyncHandler(async(req, res)=>{
    /*
        data from req.body and check wether data is empty or not
        check user is already exist or not
        uplod file on multer take a file from multer and upload on a database
        check wether the user is created or not then sent response
    */

    const {username, fullName, email, password} = req.body

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or:[{username}, {email}]
    })

    if(existedUser){
        throw new ApiError(401, "user already exisit")
    }


    const avatarLocalPath = await req.file?.path
    
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file required")
    }

    const user = await User.create({
        fullName,
        email,
        username,
        password,
        avatar:avatarLocalPath
    })
    console.log(user);
  
    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser){
        throw new ApiError(500, "something went wrong while registering user")
    }

    return res.status(200)
    .json(
        new ApiResponse(200, createdUser, "user register successsfully")
    )
})

const loginUser = asyncHandler(async(req, res)=>{
    
    const {username, email , password, confirmPassword} = req.body
 
     if(!(username || email)){
         throw new ApiError(400, "username or email is required")
     }
 
     if([password, confirmPassword].some((field) => field?.trim() === "")){
        throw new ApiError(400, "password and confirm password is required")
     }
 
     if(password !== confirmPassword){
         throw new ApiError(400, "password and confirm password does not match")
     }
 
     const user = await User.findOne(
         {
             $or:[{email}, {username}]
         }
     )
 
     if(!user){
         throw new ApiError(400, "user does not exist")
     }
 
     const isPasswordValid = user.isPasswordCorrect(password)
 
     if(!isPasswordValid){
         throw new ApiError(400, "invalid credentials")
     }
    //  console.log(user._id)
     const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)
 
     const loggedInUser = await User.findById(user._id).select("-refreshToken -password")
     if(!loggedInUser){
         throw new ApiError(500, "something went wrong while loggedIn")
     }
 
     const options ={
         httpOnly:true,
         secure:true
     }
 
     return res.status(200)
     .cookie("accessToken", accessToken, options)
     .cookie("refreshToken", refreshToken, options)
     .json(
         new ApiResponse(
             200, 
             {user:loggedInUser, accessToken:accessToken, refreshToken:refreshToken},
             "user logged In successfully"
         )
     )
  

})

const logoutUser = asyncHandler(async(req, res)=>{
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $unset:{
                refreshToken:1
            }
        },
        {
            new:true
        }
    )

    if(!user){
        throw new ApiError(401, "unauthorized request")
    }

    const options = {
        httpOnly:true,
        secure:true
    }

    return res.status(201).clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(201, {}, "user logout successfully")
    )
})

const refreshAccessToken = asyncHandler(async(req, res)=>{
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodeToken = jwt.decode(incomingRefreshToken, process.env.REFRESH_SECRET_TOKEN_KEY)

        const user = await User.findById(decodeToken?._id)
        if(!user){
            throw new ApiError(401, "invalid access")
        }
        
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh Token is expired")
        }

        const options ={
            httpOnly:true,
            secure:true
        }

        const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user?._id)

        return res.status(200).
        cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken:accessToken,
                    refreshToken:newRefreshToken
                },
                "Access Token refreshed "
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "invalid refresh Token")
    }
})

const changeCurrentPassword = asyncHandler(async(req, res)=>{
    const {oldPassword, newPassword} = req.body

    if([oldPassword, newPassword].some((field)=> field.trim() === "")){
        throw new ApiError(400, "old and new password are required")
    }

    const user = await User.findById(req.user?._id)
    const isPasswordValid = user.isPasswordCorrect(oldPassword)

    if(!isPasswordValid){
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave:false})

    return res.status(201).json(
        new ApiResponse(
            201, {}, "Password change successfully"
        )
    )
})

const getCurrentUser = asyncHandler(async(req, res)=>{
    return res.status(200).json(
        new ApiResponse(
            200,
            req.user,
            "user fetched successfully"
        )
    )
})

const updateAccountDetails = asyncHandler(async(req, res)=>{
    try {
        const {username, email, fullName} = req.body
    
        if([username, email, fullName].some((field)=> field.trim() === "")){
            throw new ApiError(400, "all field requireds")
        }
    
        const user = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set:{
                    username:username,
                    fullName:fullName,
                    email:email
                }
            },
            {
                new:true
            }
        ).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(500, "something wrong while updating user details")
        }
    
        return res.status(200).json(
            new ApiResponse(200, user, "account details update successfully")
        )
    } catch (error) {
        throw new ApiError(500, error?.message)
    }
})

const updateAavatar = asyncHandler(async(req, res)=>{
    const avatar = req.file?.['avatar'][0]
    console.log(req.file);
    if(!avatar){
        throw new ApiError(400, "avatar file is required")
    }
    
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar
            }
        },
        {
            new:true
        }
    ).select("-password -refreshToken")

    if(!user){
        throw new ApiError(500, "something went wrong while updating avatar")
    }

    return res.status(201)
    .json(
        new ApiResponse(201, user, "avatar update successfully")
    )
})

const myBlogs = asyncHandler(async(req, res)=>{
    
    const blogs = await User.aggregate([
        {
            $match:{
              _id: new mongoose.Types.ObjectId(req.user?._id),
            }
        },
        {
            $lookup: {
              from: "blogs",
              localField: "_id",
              foreignField: "owner",
              as:"blogs"
            }
          },
          {
            $project: {
              blogs:1
            }
          }
    ])

    if(!blogs){
        throw new ApiError(500, "something went wrong while fetching your blogs")
    }

    return res.status(200).json(
        new ApiResponse(200, blogs, "fetched all blogs")
    )
}) 

export{
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateAavatar,
    myBlogs
}