import mongoose, {Schema} from "mongoose";

const blogSchema = new Schema(
    {
        title:{
            type:String,
            required:true
        },
        description:{
            type:String,
            required:true
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"users"
        },
        postImage:{
            type:String,
        },
        tags:[
            String
        ],
    },
    {
        timestamps:true
    }
)

export const Blog = mongoose.model("Blog", blogSchema)