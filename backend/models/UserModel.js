import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

    firstName:{ type:String, minlength:[2,"First name must be at least 2 characters"], maxlength:[50,"First name must be at most 50 characters"],
    trim:true,required:[true,"First name is required"]},
    
    lastName:{ type:String, minlength:[2,"Last name must be at least 2 character"], maxlength:[50,"Last name must be at most 50 characters"],
    trim:true, required:[true,"Last name is required"]}, 

    email:{ type:String, trim:true, required:[true,"Email is required"], 
    match:[/^\S+@\S+\.\S+$/, "Please enter a valid email"], lowercase:true, unique:true},  

    password:{ type:String, required:[true,"Password is required"] },

    role:{ type:String, enum:[ "user", "admin"], default:"user"},

    otp:{type:String},
    
    otpExpiresAt:{type:Date}

},{timestamps: true})

const User = mongoose.model("user",userSchema)
export default User

