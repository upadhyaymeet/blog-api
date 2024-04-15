import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
    {
        username:{
            type:String,
            required:true,
            unique:true
        },
        fullName:{
            type:String,
            required:true
        },
        email:{
            type:String,
            required:true,
            unique:true
        },
        password:{
            type:String,
            required:true
        },
        avatar:{
            type:String, //url required
            required:true
        },
        blogs:[
            {
                type:Schema.Types.ObjectId,
                ref:"blogs"
            }
        ],
        refreshToken:{
            type:String
        }

    },
    {
        timestamps:true
    }
)

export const User = mongoose.model("User", userSchema)