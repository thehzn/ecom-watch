import express from "express"
import { verifyUser } from "../middleware/authVerify.js"
import { addAddress, deleteAddress, getAddresses, setDefaultAddress, updateAddress, updateUser, userProfile } from "../controllers/userControllers.js"


const router = express.Router()

router.get("/user/profile",verifyUser,userProfile)
router.put("/user/updateprofile",verifyUser,updateUser)


router.post("/user/address", verifyUser, addAddress)
router.get("/user/getaddress", verifyUser, getAddresses)
router.put("/user/editaddress/:addressId", verifyUser, updateAddress)
router.delete("/user/deleteaddress/:addressId", verifyUser, deleteAddress)
router.patch("/user/default/:addressId", verifyUser, setDefaultAddress)

export default router

