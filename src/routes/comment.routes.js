import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { addBlogComment, deleteBlogComment, updateBlogComment } from "../controllers/comment.controller.js";

const router = Router()

router.use(verifyJwt)

router.route("/b/:blogId")
.post(addBlogComment)
router.route("/c/:commentId").patch(updateBlogComment).delete(deleteBlogComment)



export default router