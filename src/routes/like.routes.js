import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { toggleBlogLike,toggleCommentLike } from "../controllers/likes.controller.js";

const router = Router()

router.use(verifyJwt)

router.route("/toggle/b/:blogId").post(toggleBlogLike)
router.route("/toggle/c/:commentId").post(toggleCommentLike)


export default router