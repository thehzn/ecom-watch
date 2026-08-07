import express from "express"
import { Adminlogin, resetAdminPassword, verifyAdminOtp } from "../controllers/adminauthControllers.js"
import { sendAdminOTP } from "../utils/sendAdminEmail.js"

const router = express.Router()
router.post("/admin/login",Adminlogin)

router.post("/admin/sendotp",sendAdminOTP)
router.post("/admin/verifyotp",verifyAdminOtp)
router.post("/admin/resetadminpassword",resetAdminPassword)



export default router