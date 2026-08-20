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


export const addAddress = async (req, res) => {
  try {
    const userId = req.user.id;

    const {firstName,lastName,phone,address,city,state,pincode,isDefault} = req.body;

    if ( !firstName || !lastName || !phone || !address || !city || !state || !pincode) {
    return res.status(400).json({status: false, message: "All address fields are required"});
    }

    const user = await User.findById(userId);

    if (!user) {
    return res.status(404).json({status: false,message: "User not found"});
    }

    const makeDefault =user.addresses.length === 0 || isDefault === true;
    if (makeDefault) {
    user.addresses.forEach((item) => { item.isDefault = false});
    }

    user.addresses.push({
      firstName,
      lastName,
      phone,
      address,
      city,
      state,
      pincode,
      isDefault: makeDefault
    });

    await user.save();

    return res.status(201).json({ status: true,message: "Address added successfully", addresses: user.addresses});

  } catch (error) {
    return res.status(500).json({status: false,message: error.message});
  }
}


export const getAddresses = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("addresses");

    if (!user) {
    return res.status(404).json({status: false,message: "User not found"});
    }

    return res.status(200).json({status: true,message: "Addresses fetched successfully",addresses: user.addresses});

  } catch (error) {
    return res.status(500).json({status: false,message: error.message});
  }
}


export const updateAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;

    const {firstName,lastName,phone,address,city,state,pincode,isDefault} = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({status: false, message: "User not found"});
    }

    const existingAddress = user.addresses.id(addressId);
    if (!existingAddress) {
      return res.status(404).json({ status: false, message: "Address not found"});
    }

    if (isDefault === true) {
      user.addresses.forEach((item) => {
        item.isDefault = false;
      });
    }

    existingAddress.firstName = firstName;
    existingAddress.lastName = lastName;
    existingAddress.phone = phone;
    existingAddress.address = address;
    existingAddress.city = city;
    existingAddress.state = state;
    existingAddress.pincode = pincode;

    if (isDefault !== undefined) {
      existingAddress.isDefault = isDefault;
    }

    await user.save();
    return res.status(200).json({status: true,message: "Address updated successfully",addresses: user.addresses});

  } catch (error) {
    return res.status(500).json({status: false, message: error.message });
  }
}



export const deleteAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
    return res.status(404).json({ status: false, message: "User not found"});
    }

    const existingAddress = user.addresses.id(addressId);
    if (!existingAddress) {
    return res.status(404).json({status: false,message: "Address not found"});
    }

    const wasDefault = existingAddress.isDefault;

    user.addresses.pull(addressId);
    if (wasDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
    }

    await user.save();
    return res.status(200).json({ status: true,message: "Address deleted successfully",addresses: user.addresses});

  } catch (error) {
    return res.status(500).json({status: false, message: error.message});
  }
}


export const setDefaultAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
    return res.status(404).json({status: false, message: "User not found"});
    }

    const selectedAddress = user.addresses.id(addressId);
    if (!selectedAddress) {
    return res.status(404).json({status: false,message: "Address not found"});
    }

    user.addresses.forEach((item) => {
    item.isDefault = item._id.equals(addressId)
    });

    await user.save();
    return res.status(200).json({status: true,message: "Default address updated successfully",  addresses: user.addresses});
  } catch (error) {
    return res.status(500).json({status: false,message: error.message});
  }
}