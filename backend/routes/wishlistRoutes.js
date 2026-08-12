import express  from "express"
import { addToWishlist, getWishlist, removeFromWishlist } from "../controllers/wishlistController.js"
import { verifyUser } from "../middleware/authVerify.js"


const router = express.Router()

router.post("/addwishlist/:productId", verifyUser, addToWishlist)
router.get("/getwishlists", verifyUser, getWishlist)
router.delete("/removefromlist/:productId", verifyUser, removeFromWishlist)


export default router