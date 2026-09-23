import mongoose from "mongoose"

const adminSchema = new mongoose.Schema({
    email:{ type:String,required:true, unique:true},
    password:{ type:String,required:true},
    otp:{type:String}, 
    otpExpiresAt:{type:Date},
    googleId: { type: String, unique: true, sparse: true, },
    pendingEmail: String
},
{timestamps:true})

const Admin = mongoose.model("Admin", adminSchema)
export default Admin