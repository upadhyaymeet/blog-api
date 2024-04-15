import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"

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

userSchema.pre("save", function async(){
    if(!this.isModified("password")) return next()

    this.password = bcrypt.hash(this.password, 10)
})

export const User = mongoose.model("User", userSchema)