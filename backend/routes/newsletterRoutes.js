import express from "express"
import { subscribeNewsletter } from "../controllers/newsLetterController.js"


const router = express.Router()

router.post("/subscribe", subscribeNewsletter)

export default router 