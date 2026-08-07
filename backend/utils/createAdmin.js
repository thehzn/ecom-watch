import argon from "argon2"
import Admin from "../models/AdminModel.js"

export const createAdmin = async () =>{
    try {
        const existAdmin = await Admin.findOne({ email:"najishaadmin123@gmail.com" })
        if(existAdmin) {
            console.log("Admin already exist");
            return  
         }
            const hashedPassword = await argon.hash("Admin123#")
            await Admin.create({
                email:"najishaadmin123@gmail.com",
                password:hashedPassword
             })
          console.log("Default Admin created");
    } catch (error) {
      console.log("Admin is not created an error occured :",error.message);
    }
}