import express from "express"
import { subscribeNewsletter } from "../controllers/newsLetterController.js"
import { verifyUser } from "../middleware/authVerify.js"


const router = express.Router()

router.post("/subscribe", verifyUser, subscribeNewsletter)

export default router 