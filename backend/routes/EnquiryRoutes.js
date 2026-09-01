import express from "express"
import { createEnquiry, getAllEnquiries, updateEnquiryStatus } from "../controllers/EnquiryControllers.js"
import { verifyAdmin } from "../middleware/AdminVerify.js"
import { optionalVerifyUser } from "../middleware/authVerify.js"


const router = express.Router()

router.post("/userenquiry", optionalVerifyUser, createEnquiry)
router.get("/allenquiry", verifyAdmin, getAllEnquiries)
router.patch("/updateenquiry/:id", verifyAdmin, updateEnquiryStatus)

export default router