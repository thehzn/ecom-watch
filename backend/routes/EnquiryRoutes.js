import express from "express"
import { createEnquiry, getAllEnquiries, updateEnquiryStatus } from "../controllers/EnquiryControllers.js"
import { verifyAdmin } from "../middleware/AdminVerify.js"


const router = express.Router()

router.post("/userenquiry",createEnquiry)
router.get("/allenquiry", verifyAdmin, getAllEnquiries)
router.patch("/updateenquiry/:id", verifyAdmin, updateEnquiryStatus)

export default router