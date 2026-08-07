import express from "express"
import { verifyAdmin } from "../middleware/AdminVerify.js"
import upload from "../config/multer.js"
import { addProduct, deleteProduct, getAllProducts, getSingleProduct, searchProducts, updateProduct } from "../controllers/ProductControllers.js"

const router = express.Router()
 router.post("/addproduct",verifyAdmin, upload.fields([{ name: "mainImage", maxCount: 1}, { name:"images", maxCount: 3}]),addProduct)
 router.get("/getallproducts",getAllProducts)
 router.get("/getsingleproduct/:id",getSingleProduct)

 router.put("/updateproduct/:id", verifyAdmin,updateProduct)
 router.delete("/deleteproduct/:id",verifyAdmin,deleteProduct)

 router.get("/searchProduct",searchProducts)

export default router