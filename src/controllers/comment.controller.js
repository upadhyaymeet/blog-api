import mongoose, {isValidObjectId} from "mongoose";
import { Comment } from "../models/comment.model.js"
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const addComment = asyncHandler(async(req, res)=>{
    const {blogId} = req.params
    const {content} = req.body

    if(!isValidObjectId(blogId)){
        throw new ApiError(400, "Invalid blog id")
    }

    if(content.trim() === ""){
        throw new ApiError(400, "content required")
    }

    const comment = await Comment.create({
        content,
        owner:req.user?._id,
        blog:blogId
    })

    if(!comment){
        throw new ApiError(500, "something went wrong try again")
    }

    return res.status(200).json(
        new ApiResponse(200, comment, "comment added successfully")
    )
})

export {
    addComment
}