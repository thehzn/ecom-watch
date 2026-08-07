import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

export const verifyAdmin = async ( req,res,next )=>{
  try {
      const adminToken = req.headers.authorization;
    if(!adminToken){
        return res.status(401).json({ status:false, message:"Token not Found"})
    }
    const token = adminToken.split(" ")[1];
    const decodedData = jwt.verify(token, process.env.JWT_SECRET)
    if(decodedData.role !== "admin") {
        return res.status(401).json({ status:false, message:"Access Denied"})
    }
    req.user = decodedData;
    next();
  } catch (error) {
    return res.status(401).json({ status:false, message:error.message})
  }
}

