import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { Blog } from "../models/blog.model.js"
import { User } from "../models/user.model.js";
import mongoose, {isValidObjectId} from "mongoose";

const publishABlog = asyncHandler(async(req, res)=>{
    const {title, description, tags} =req.body

    if([title, description].some((field)=>field?.trim() === "")){
        throw new ApiError(400, "title and description are required")
    }
    const postImage = req.file?.path
    if(!postImage){
        throw new ApiError(400, "post image is required")
    }

    const blog = await Blog.create(
        {
            title,
            description,
            tags:tags || "",
            postImage:postImage,
            owner:req.user?._id,
            isPublished:false
        }
    )

    const blogUploaded = await Blog.findById(blog._id)
    
    if(!blogUploaded){
        throw new ApiError(500, "something went wrong while uploading blog")
    }

    return res.status(200).json(
        new ApiResponse(
            200, blog, "successfully blog created"
        )
    )
})

const getBlogById = asyncHandler(async(req, res)=>{
    const {blogId} = req.params

    if(!isValidObjectId(blogId)){
        throw new ApiError(400, "invalid object id")
    }

    if(!isValidObjectId(req.user?._id)){
        throw new ApiError(400, "invalid user id")
    }

    const blog = await Blog.aggregate(
        [
            {
                $match:{
                    _id:new mongoose.Types.ObjectId(blogId)
                }
            },
            {
              $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "blog",
                as: "likes"
              }
            },
            {
              $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "blog",
                as: "comment"
              }
            },
            {
              $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline:[
                  {
                    $project:{
                      username:1,
                      avatar:1,
                      fullName:1
                    }
                  }
                ]
              }
            },
            {
              $addFields: {
                likesCount:{
                  $size:"$likes"
                },
              }
            },
            {
              $project: {
                title:1,
                description:1,
                owner:1,
                postImage:1,
                createdAt:1,
                comment:1,
                likesCount:1
              }
            }
          ]                   
    )

    if(!blog){
        throw new ApiError(500, "failed to fetch blog")
    }

    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $addToSet:{
                blogs:blogId
            }
        }
    )

    return res.status(200).json(
        new ApiResponse(
            200, blog[0],"blog details fetched successfully"
        )
    )
})

export {
    publishABlog,
    getBlogById
}