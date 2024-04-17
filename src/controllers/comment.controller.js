import mongoose, {isValidObjectId} from "mongoose";
import { Comment } from "../models/comment.model.js"
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import {Like} from "../models/likes.model.js"

const addBlogComment = asyncHandler(async(req, res)=>{
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

const deleteBlogComment = asyncHandler(async(req, res)=>{
    const {commentId} = req.params

    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid blogId")
    }

    const comment = await Comment.findById(commentId)

    if(!comment){
        throw new ApiError(404, "comment does not found")
    }

    if(comment?.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(400, "only owner can delete the comment")
    }

    const deleteComment = await Comment.findByIdAndDelete(commentId)
    if(!deleteComment){
        throw new ApiError(500, "something went wrong while deleting comment")
    }

    await Like.deleteMany({
        comment:commentId,
        likedBy:req.user
    })

    return res.status(201).json(
        new ApiResponse(201, {}, "delete comment successfully")
    )

})

const updateBlogComment = asyncHandler(async(req, res)=>{
    const {commentId} = req.params
    const {content} = req.body

    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid commentId")
    }

    const comment = await Comment.findById(commentId)

    if(!comment){
        throw new ApiError(404, "comment not found")
    }

    if(comment?.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(400, "only owner can update comment")
    }

    const updateComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set:{
                content
            }
        },
        {
            new:true
        }
    )

    if(!updateComment){
        throw new ApiError(500, "something went wrong while update comment")
    }

    return res.status(200).json(
        new ApiResponse(200, updateComment, "comment update successfully")
    )
})


export {
    addBlogComment,
    deleteBlogComment,
    updateBlogComment
}
