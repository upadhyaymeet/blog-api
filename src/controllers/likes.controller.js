import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Like } from "../models/likes.model.js"
import { isValidObjectId } from "mongoose";

const toggleBlogLike = asyncHandler(async(req, res)=>{
    const {blogId} = req.params

    if(!isValidObjectId(blogId)){
        throw new ApiError(400, "invalid blogId")
    }

    const isLiked = await Like.findOne(
        {
            blog:blogId,
            likedBy:req.user?._id
        }
    )

    if(isLiked){
        await Like.findByIdAndDelete(isLiked?._id)
        return res.status(200)
        .json(new ApiResponse(200, {isLiked:false}))
    }

    await Like.create({
        blog:blogId,
        likedBy:req.user?._id
    })

    return res.status(200)
    .json(
        new ApiResponse(200, {isLiked:true})
    )
})

const toggleCommentLike = asyncHandler(async(req, res)=>{
    const {commentId} = req.params

    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "invalid comment id")
    }

    const isLiked = await Like.findOne({
        comment:commentId,
        likedBy:req.user?._id
    })

    if(isLiked){
        await Like.findByIdAndDelete(isLiked?._id)

        return res.status(200).json(
            new ApiResponse(200, {isLiked:false})
        )
    }

    await Like.create(
        {
            comment:commentId,
            likedBy:req.user?._id
        }
    )

    return res.status(200).json(
        new ApiResponse(200, {isLiked:true})
    )
})

export {
    toggleBlogLike,
    toggleCommentLike
}