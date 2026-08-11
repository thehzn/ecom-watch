import express from "express"
import { verifyAdmin } from "../middleware/AdminVerify.js"
import { deleteCustomer, getAllCustomers, searchCustomers } from "../controllers/customerController.js"


const router = express.Router()

router.get("/allcustomers", verifyAdmin, getAllCustomers)
router.get("/searchcustomers", verifyAdmin, searchCustomers)

router.delete("/deletecustomer/:id", verifyAdmin, deleteCustomer)


export default router