import express from "express"
import { verifyUser } from "../middleware/authVerify.js"
import { updateUser, userProfile } from "../controllers/userControllers.js"


const router = express.Router()

router.get("/user/profile",verifyUser,userProfile)
router.put("/user/updateprofile",verifyUser,updateUser)

export default router

