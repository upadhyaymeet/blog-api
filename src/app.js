import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"

const app = express()
app.use(cors(
    {
        origin:process.env.CORS_ORIGIN,
        credentials:true
    }
))

app.use(express.json({limit:"16kb"}))
app.use(express.static("public"))
app.use(express.urlencoded({extended:true, limit:"16kb"}))
app.use(cookieParser())

import userRouter from "./routes/user.routes.js"
import blogRouter from "./routes/blog.routes.js"
import likeRouter from "./routes/like.routes.js"
import commentRouter from "./routes/comment.routes.js"

app.use("/api/v1/user", userRouter)
app.use("/api/v1/blog", blogRouter)
app.use("/api/v1/like", likeRouter)
app.use("/api/v1/comment", commentRouter)

export{app}