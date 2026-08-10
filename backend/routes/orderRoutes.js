import express from "express"
import { cancelOrder, createOrder, getAllOrders, getMyOrders, getSingleOrder, getsingleOrderDetails, markAsShipped, verifyPayment } from "../controllers/orderCotrollers.js";
import { verifyUser } from "../middleware/authVerify.js";
import { verifyAdmin } from "../middleware/AdminVerify.js";

const router = express.Router()

router.post("/ordercreate", verifyUser, createOrder)
router.post("/verifypayment", verifyUser,verifyPayment)

router.get("/myordes", verifyUser,getMyOrders)
router.get("/signleorder/:id", verifyUser,getSingleOrder)

router.get("/getallorders", verifyAdmin,getAllOrders)
router.get("/getsingleorder/:id", verifyAdmin, getsingleOrderDetails)

router.patch("/markasshipped/:id", verifyAdmin, markAsShipped)
router.delete("/cancelorder/:id", verifyAdmin, cancelOrder)

export default router