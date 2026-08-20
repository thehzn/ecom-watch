import express from "express";
import { verifyAdmin } from "../middleware/AdminVerify.js";
import { getNotifications, getUnreadNotificationCount, markNotificationAsRead } from "../controllers/NotificationControllers.js";


const router = express.Router();

router.get("/notifications", verifyAdmin,getNotifications);
router.get("/getcountofnotify", verifyAdmin, getUnreadNotificationCount)
router.patch("/markasread/:id", verifyAdmin, markNotificationAsRead)

export default router;