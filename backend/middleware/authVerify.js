import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

export const verifyUser = async ( req,res,next )=>{
  try {
      const userToken = req.headers.authorization;
    if(!userToken){
        return res.status(401).json({ status:false, message:"Token not Found"})
    }
    const token = userToken.split(" ")[1];
    const decodedData = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decodedData;
    next();
  } catch (error) {
    return res.status(401).json({ status:false, message:error.message})
  }
}


export const optionalVerifyUser = async (req, res, next) => {
  try {
    const userToken = req.headers.authorization;
    if (!userToken) {
      return next();
    }

    const token = userToken.split(" ")[1];
    if (!token) {
    return next();
    }
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodedData;
    next();

  } catch (error) {
    return res.status(401).json({status: false,message: "Invalid or expired token"});
  }
}