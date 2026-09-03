import express from "express";
import dotenv from "dotenv"
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import adminauthroutes from "./routes/adminauthRoutes.js"
import productroutes from "./routes/productRoutes.js"
import cartroutes from "./routes/cartRoutes.js"
import wishlistroutes from "./routes/wishlistRoutes.js"
import orderRoutes from "./routes/orderRoutes.js"
import customerRoutes from "./routes/customerRoutes.js"
import newsletterRoutes from "./routes/newsletterRoutes.js"
import notificationRoutes from "./routes/NotificationRoutes.js"
import dashboardRoutes from "./routes/dashboardRoutes.js"
import enquiryRoutes from "./routes/EnquiryRoutes.js"
import { createAdmin } from "./utils/createAdmin.js";



const app = express();
dotenv.config();

connectDB();

const PORT = process.env.PORT  || 3000



app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.json({
    message: "CHRONOS Backend is running"
  });
});


app.use("/apiauth",authRoutes)
app.use("/apiuser",userRoutes)
app.use("/apiadmin",adminauthroutes)
app.use("/apiproduct",productroutes)
app.use("/apicarts",cartroutes)
app.use("/apiwishlist",wishlistroutes)
app.use("/apiorders",orderRoutes)
app.use("/apicustomers",customerRoutes)
app.use("/newsletter",newsletterRoutes)
app.use("/apinotify",notificationRoutes)
app.use("/dashboard", dashboardRoutes)
app.use("/enquiry",enquiryRoutes)



app.listen(PORT, async()=>{
   await createAdmin()
    console.log(`Server is running on PORT ${PORT}`);   
})

export default app;