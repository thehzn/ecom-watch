import express from "express"
import { addtoCart, getCart, removeFromCart, updateCart } from "../controllers/cartControllers.js"
import { verifyUser } from "../middleware/authVerify.js"

const router = express.Router()

router.post("/addtocart", verifyUser, addtoCart)
router.get("/getcartitems",verifyUser, getCart)

router.patch("/updatequantity", verifyUser,updateCart)
router.delete("/deletecartproducts/:ProductId", verifyUser, removeFromCart)

export default router