import User from "../models/UserModel.js"
import argon from "argon2"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()


export const register = async ( req, res ) =>{
     try {
        const { firstName, lastName, email, countryCode,mobileNumber, password, confirmPassword } = req.body;
        if( !firstName || !lastName || !email || !countryCode || !mobileNumber || !password || !confirmPassword ) return res.status(400).json({status:false, message:"Must Fill all Fields"})
        const passwordRegex =/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

        if(password !== confirmPassword){
         return res.status(400).json({ status:false, message:"Passwords do not match"})
        }

     if (!passwordRegex.test(password)) {
      return res.status(400).json({ status:false,
      message:"Password must be at least 8 characters and contain 1 uppercase, 1 lowercase, 1 number and 1 special character" })
     }

      const mobileRegex = /^[0-9]{10}$/;

      if (!mobileRegex.test(mobileNumber)) {
      return res.status(400).json({status: false,message: "Please enter a valid mobile number"});
      }

     const existingUser = await User.findOne({ email })
     if(existingUser) return res.status(400).json({ status:false, message:"User already exist" })
        
     const hashedPassword = await argon.hash(password)
     const userDetails = await User.create({
        firstName,
        lastName,
        email,
        countryCode,
        mobileNumber,
        password:hashedPassword
     })
     return res.status(200).json({ status:true, message:"User Registered Successfully" })
     } catch (error) {
      return res.status(500).json({ status:false, message:error.message })      
    }
}


export const login = async ( req, res ) =>{
   try {
      const { email, password } = req.body;
      if( !email || !password ) return res.status(400).json({status:false, message:"All fields must be filled"})
         const currentUser = await User.findOne({ email })
      if(!currentUser){
         return res.status(400).json({ status:false, message:"Invalid User or Password"})
      }
      if(currentUser.role !== "user" ) return res.status(404).json({ status:false, message:"Access Denied"})
         const isMatch = await argon.verify(currentUser.password, password)
      if(!isMatch) return res.status(400).json({ status:false, message:"Invalid Password"})
         const userToken = jwt.sign({ id:currentUser._id , role:currentUser.role },process.env.JWT_SECRET,{expiresIn:"1d"} )
      return res.status(200).json({ status:true, message:"Successfully Loggedin",token:userToken,
         user:{
            firstName:currentUser.firstName,
            lastName:currentUser.lastName,
            email:currentUser.email,
            countryCode: currentUser.countryCode,
            mobileNumber: currentUser.mobileNumber,
            role:currentUser.role
      }})
   } catch (error) {
      return res.status(500).json({ status:false, message:error.message })            
   }
}


export const verifyOtp = async ( req, res ) =>{
   try {
      const { email, otp } = req.body
      const user = await User.findOne({ email, role:"user" })
      if(!user){
      return res.status(401).json({ status:false, message:"Invalid User" })
      }

      if( user.otp !== otp )
      return res.status(400).json( {status:false, message:"OTP is invalid" })

      if(user.otpExpiresAt < Date.now())
      return res.status(400).json({ status:false, message:"OTP is expired" })

      user.otp = null
      user.otpExpiresAt = null
      await user.save()

      const resetToken = jwt.sign({ id:user._id, purpose:"reset" }, process.env.JWT_SECRET, {expiresIn:"10m"} )
      return res.status(200).json({ status:true, message:"OTP Verified" ,resetToken })

   } catch (error) {
      return res.status(500).json({ status:false, message:error.message })  
   }
}

export const resetPassword = async (req, res) => {
  try {
    const { resetToken, password, confirmPassword } = req.body;

    if (!resetToken || !password || !confirmPassword) {
      return res.status(400).json({status: false,message: "All fields are required"});
    }

    if (password !== confirmPassword) {
      return res.status(400).json({status: false,  message: "Passwords do not match" });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({status: false,
        message: "Password must be at least 8 characters and contain uppercase, lowercase, number and special character." });
    }

    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);

    if (decoded.purpose !== "reset") {
      return res.status(400).json({ status: false, message: "Invalid token" });
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    user.password = await argon.hash(password);

    await user.save();

    return res.status(200).json({status: true, message: "Password updated successfully"});

  } catch (error) {
    return res.status(500).json({ status: false, message: error.message});
  }
};