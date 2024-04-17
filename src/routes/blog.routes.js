import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { deleteBlog, getBlogById, publishABlog,  updateBlog } from "../controllers/blog.controller.js";

const router = Router()
router.use(verifyJwt)

router.route("/")
.post(upload.single("postImage"), publishABlog)

router.route("/:blogId")
.get(getBlogById)
.patch(updateBlog)
.delete(deleteBlog)


export default router