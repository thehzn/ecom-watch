import mongoose from "mongoose"

const adminSchema = new mongoose.Schema({
    email:{ type:String,required:true, unique:true},
    password:{ type:String,required:true},
    otp:{type:String}, 
    otpExpiresAt:{type:Date}
},
{timestamps:true})

const Admin = mongoose.model("Admin", adminSchema)
export default Admin