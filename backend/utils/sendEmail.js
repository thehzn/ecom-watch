import User from "../models/UserModel.js"
import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config()

const transporter = nodemailer.createTransport({
 service:"gmail",
  auth: {
    user: process.env.email,
    pass: process.env.OTP_Password,
  },
});

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();


export const sendOTP = async ( req, res ) =>{
    try {
        const  { email } = req.body;
        const user = await User.findOne({email, role:"user" });
        if(!user){
        return res.status(401).json({ status:false, message:"Invalid Mail id"})
        }
        const userOTP = generateOTP()
        user.otp = userOTP;
        user.otpExpiresAt = Date.now() + 5 * 60 * 1000;
        await user.save()

     await transporter.sendMail({
     from: process.env.email, 
     to: email, 
     subject: "OTP Verification", 
     html: `<h2>Your OTP: ${userOTP} </h2> <p> Valid for 5 minutes </p>`,
  });
      return res.status(200).json({message:"OTP sent Successfully"})

     } catch (error) {
      return res.status(500).json({message:error.message})
      
     }
}