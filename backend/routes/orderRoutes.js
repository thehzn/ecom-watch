import express from "express";
import { cancelMyOrder, cancelOrder, createOrder, getAllOrders, getMyOrders, getSingleOrder, getsingleOrderDetails,
  getTrendingProducts, markAsDelivered, markAsShipped, markPaymentFailed, retryPayment, verifyPayment } from "../controllers/orderCotrollers.js";
import { verifyUser } from "../middleware/authVerify.js";
import { verifyAdmin } from "../middleware/AdminVerify.js";

const router = express.Router();

router.post("/ordercreate", verifyUser, createOrder);
router.post("/verifypayment", verifyUser, verifyPayment);

router.post("/retrypayment/:id", verifyUser, retryPayment);
router.post("/markpaymentfailed", verifyUser, markPaymentFailed);

router.get("/myordes", verifyUser, getMyOrders);
router.get("/singleorder/:id", verifyUser, getSingleOrder);

// User cancel order routes (supports multiple casing conventions)
router.delete("/cancelMyOrder/:id", verifyUser, cancelMyOrder);
router.delete("/cancelmyorder/:id", verifyUser, cancelMyOrder);

// Admin routes
router.get("/getallorders", verifyAdmin, getAllOrders);
router.get("/getsingleorder/:id", verifyAdmin, getsingleOrderDetails);
router.patch("/markasshipped/:id", verifyAdmin, markAsShipped);
router.delete("/cancelorder/:id", verifyAdmin, cancelOrder);
router.patch("/markasdelivered/:id", verifyAdmin, markAsDelivered)


router.get("/trending", getTrendingProducts);

export default router;
