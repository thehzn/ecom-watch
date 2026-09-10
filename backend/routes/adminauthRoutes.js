import express from "express"
import { Adminlogin, resetAdminPassword, sendAdminEmailChangeOTP, verifyAdminEmailChangeOTP, verifyAdminOtp } from "../controllers/adminauthControllers.js"
import { sendAdminOTP } from "../utils/sendAdminEmail.js"
import { verifyAdmin } from "../middleware/AdminVerify.js"

const router = express.Router()
router.post("/admin/login",Adminlogin)

router.post("/admin/sendotp",sendAdminOTP)
router.post("/admin/verifyotp",verifyAdminOtp)
router.post("/admin/resetadminpassword",resetAdminPassword)


router.post("/admin/change-email", verifyAdmin, sendAdminEmailChangeOTP)
router.post("/admin/verify-email", verifyAdmin, verifyAdminEmailChangeOTP)



export default router