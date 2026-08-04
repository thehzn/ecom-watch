import User from "../models/UserModel.js"
import argon from "argon2"


export const userProfile = async ( req, res ) =>{
    try {
    const userId = req.user.id;
    const existUser = await User.findById(userId).select('-password'); 
    if(!existUser) return res.status(401).json({ status:false, message:"Invalid user"})
        return res.status(200).json({ status:true, message:"User Fetched Sucessfully", userDetails:existUser})
    } catch (error) {
    return res.status(500).json({ status:false, message:error.message})       
    }
}



export const updateUser = async ( req, res ) =>{
    try {
        const userId = req.user.id      
        const allowedFields = ["firstName", "lastName", "email", "password"]
        const updates = {}
        
             allowedFields.forEach(fields =>{
                 if(req.body[fields]){
                    updates[fields] = req.body[fields]
                 }
             })
         if(updates.password){
         updates.password = await argon.hash(updates.password)
         }

         const updatedDetails = await User.findByIdAndUpdate(userId, {$set:updates}, {returnDocument:'after', runValidators:true})
         if(!updatedDetails){
         return res.status(404).json({ status:false, message:"Invalid User"})
         }

         const { password, ...userData } = updatedDetails.toObject()
         return res.status(200).json({ status:true, message:"Updated User Datas", user:userData})
    }     catch (error) {
          return res.status(500).json({ status:false, message:error.message})  
    }
}