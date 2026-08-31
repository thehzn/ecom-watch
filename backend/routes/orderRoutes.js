import express from "express"
import { cancelMyOrder, cancelOrder, confirmOrderReceived, createOrder, getAllOrders, getMyOrders, getSingleOrder, getsingleOrderDetails, getTrendingProducts, markAsShipped, verifyPayment } from "../controllers/orderCotrollers.js";
import { verifyUser } from "../middleware/authVerify.js";
import { verifyAdmin } from "../middleware/AdminVerify.js";

const router = express.Router()

router.post("/ordercreate", verifyUser, createOrder)
router.post("/verifypayment", verifyUser,verifyPayment)

router.get("/myordes", verifyUser,getMyOrders)
router.get("/signleorder/:id", verifyUser,getSingleOrder)
router.delete("/cancelMyOrder/:id", verifyUser, cancelMyOrder )
router.patch("/markasdelivered/:id", verifyUser, confirmOrderReceived)

router.get("/getallorders", verifyAdmin,getAllOrders)
router.get("/getsingleorder/:id", verifyAdmin, getsingleOrderDetails)

router.patch("/markasshipped/:id", verifyAdmin, markAsShipped)
router.delete("/cancelorder/:id", verifyAdmin, cancelOrder)

router.get("/trending", getTrendingProducts);

export default router