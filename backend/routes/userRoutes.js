import express from "express"
import { verifyUser } from "../middleware/authVerify.js"
import { addAddress, changeUserEmail, deleteAddress, getAddresses, sendEmailChangeOTP, sendPasswordChangeOTP, setDefaultAddress, updateAddress, updateUser, userProfile, verifyEmailChangeOTP, verifyPasswordChangeOTP ,sendMobileChangeOTP,verifyMobileChangeOTP,updateMobileNumber } from "../controllers/userControllers.js"


const router = express.Router()

router.get("/user/profile",verifyUser,userProfile)
router.put("/user/updateprofile",verifyUser,updateUser)


router.post("/user/address", verifyUser, addAddress)
router.get("/user/getaddress", verifyUser, getAddresses)
router.put("/user/editaddress/:addressId", verifyUser, updateAddress)
router.delete("/user/deleteaddress/:addressId", verifyUser, deleteAddress)
router.patch("/user/default/:addressId", verifyUser, setDefaultAddress)


router.post("/user/send-email-change-otp", verifyUser, sendEmailChangeOTP)
router.post("/user/verify-email-change-otp", verifyUser, verifyEmailChangeOTP)
router.put("/user/change-email", verifyUser, changeUserEmail)


router.post("/user/send-password-change-otp", verifyUser, sendPasswordChangeOTP)
router.post( "/user/verify-password-change-otp", verifyUser,verifyPasswordChangeOTP)

// =============================================
// MOBILE NUMBER UPDATE ROUTES
// =============================================

router.post("/user/send-mobile-change-otp", verifyUser, sendMobileChangeOTP)
router.post("/user/verify-mobile-change-otp", verifyUser, verifyMobileChangeOTP)
router.put("/user/update-mobile-number", verifyUser, updateMobileNumber)


export default router

