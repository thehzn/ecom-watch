import express from "express";
import dotenv from "dotenv"
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import adminauthroutes from "./routes/adminauthRoutes.js"
import productroutes from "./routes/productRoutes.js"
import cartroutes from "./routes/cartRoutes.js"
import orderRoutes from "./routes/orderRoutes.js"
import { createAdmin } from "./utils/createAdmin.js";


const app = express();
dotenv.config();

connectDB();

const PORT = process.env.PORT  || 3000



app.use(cors());
app.use(express.json());


app.use("/apiauth",authRoutes)
app.use("/apiuser",userRoutes)
app.use("/apiadmin",adminauthroutes)
app.use("/apiproduct",productroutes)
app.use("/apicarts",cartroutes)
app.use("/apiorders",orderRoutes)

app.listen(PORT, async()=>{
   await createAdmin()
    console.log(`Server is running on PORT ${PORT}`);   
})

export default app;