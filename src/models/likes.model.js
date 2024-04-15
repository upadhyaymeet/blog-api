import mongoose, {Schema} from "mongoose";

const likeSchema = new Schema(
    {
        comment:{
            type:Schema.Types.ObjectId,
            ref:"comments"
        },
        blog:{
            type:Schema.Types.ObjectId,
            ref:"blogs"
        },
        tweet:{
            type:Schema.Types.ObjectId,
            ref:"tweets"
        },
        likedBy:{
            type:Schema.Types.ObjectId,
            ref:"users"
        }
    },
    {
        timestamps:true
    }
)

export const Like = mongoose.model("Like", likeSchema)