import express from "express";
import dotenv from "dotenv"
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js"
import userRoutes from "./routes/userRoutes.js"

const app = express();
dotenv.config();

connectDB();

const PORT = process.env.PORT  || 3000



app.use(cors());
app.use(express.json());


app.use("/apiauth",authRoutes)
app.use("/apiuser",userRoutes)

app.listen(PORT,()=>{
    console.log(`Server is running on PORT ${PORT}`);   
})

export default app;