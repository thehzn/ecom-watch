import User from "../models/UserModel.js";


export const getAllCustomers = async ( req, res ) =>{
    try {
       const customers = await User.find({role:"user"}, "firstName lastName email").sort({ createdAt: -1 })
       if(customers.length === 0){ 
        return res.status(401).json({ status: false, message:"Users not found"}) 
       }
        return res.status(200).json({ status: true, message:"Users Details Fetched", customers}) 
    } catch (error) {
    return res.status(500).json({ status:false, message: error.message})        
    }
}


export const searchCustomers = async (req, res) => {
  try {
    const { search } = req.query;
    const customers = await User.find({role: "user",
      $or: [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ]}, "firstName lastName email").sort({ createdAt: -1 });

    return res.status(200).json({status: true,message: "Customers search successful",customers});

  } catch (error) {
    return res.status(500).json({status: false,message: error.message});
  }
}


export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await User.findOne({ _id: id, role: "user"});

    if (!customer) {
      return res.status(404).json({status: false,message: "Customer not found"});
    }
    await User.findByIdAndDelete(id);
    return res.status(200).json({ status: true, message: "Customer deleted successfully"});
  } catch (error) {
    return res.status(500).json({status: false,message: error.message});
  }
}