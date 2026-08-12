import express from "express"
import { verifyAdmin } from "../middleware/AdminVerify.js"
import { getDashboard } from "../controllers/dashboardContoller.js"


const router = express.Router()

router.get("/getdashboard", verifyAdmin, getDashboard)


export default router