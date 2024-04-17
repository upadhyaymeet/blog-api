import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { addComment } from "../controllers/comment.controller.js";

const router = Router()

router.use(verifyJwt)

router.route("/:blogId").post(addComment)


export default router