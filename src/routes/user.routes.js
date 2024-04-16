import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser, updateAavatar, updateAccountDetails } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js"

const router = Router()


router.route("/register").post(
    upload.single("avatar")
    ,registerUser)
router.route("/login").post(loginUser)

// secured routes 
router.route("/logout").post(verifyJwt, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/password").patch(verifyJwt, changeCurrentPassword)
router.route("/user").get(verifyJwt, getCurrentUser)
router.route("/update-details").patch(verifyJwt, updateAccountDetails)
router.route("/avatar").patch(verifyJwt, upload.single("avatar"), updateAavatar)

export default router