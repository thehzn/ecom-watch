import express from "express"
import { login, register, resetPassword, verifyOtp } from "../controllers/authControllers.js"
import { sendOTP } from "../utils/sendEmail.js"


const router = express.Router()

router.post("/user/register",register)
router.post("/user/login",login)

router.post("/user/sendotp",sendOTP)
router.post("/user/verifyotp",verifyOtp)
router.post("/user/resetpassword",resetPassword)



export default router








