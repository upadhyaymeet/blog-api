import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

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
        },
        blogs:[
            {
                type:Schema.Types.ObjectId,
                ref:"blogs"
            }
        ],
        blogsHistory:[
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

userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next()

    this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id:this._id
        },
        process.env.ACCESS_SECRET_TOKEN_KEY,
        {
            expiresIn:process.env.ACCESS_SECRET_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id:this._id
        },
        process.env.REFRESH_SECRET_TOKEN_KEY,
        {
            expiresIn:process.env.REFRESH_SECRET_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)