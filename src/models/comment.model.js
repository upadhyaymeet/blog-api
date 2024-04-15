import mongoose, {Schema} from "mongoose";

const commentSchema = new Schema(
    {
        content:{
            type:String,
            required:true
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"users"
        },
        blog:{
            type:Schema.Types.ObjectId,
            ref:"blogs"
        },
        tweet:{
            type:Schema.Types.ObjectId,
            ref:"tweets"
        }
    },
    {
        timestamps:true
    }
)

export const Comment = mongoose.model("Comment", commentSchema)