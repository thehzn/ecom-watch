import Order from "../models/OrderModel.js";
import User from "../models/UserModel.js";
import Product from "../models/ProductModel.js";

export const getDashboard = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalCustomers = await User.countDocuments({role: "user"});
    const revenueResult = await Order.aggregate([
      {
        $match: {
          paymentStatus: "Paid",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$total",
          },
        },
      },
    ]);

    const totalRevenue =revenueResult.length > 0 ? revenueResult[0].totalRevenue: 0;
    const outOfStock = await Product.find({ stock: 0,}).select("modelName sku stock").lean();
    const lowStock = await Product.find({stock: {$gt: 0,$lt: 4,}}).select("modelName sku stock").lean();

    const inventoryNotifications = [...outOfStock.map((product) => ({ ...product, status: "Out of Stock"})),
      ...lowStock.map((product) => ({...product, status: "Low Stock"}))]
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 3);

    const recentOrders = await Order.find().populate("user", "firstName lastName").sort({ createdAt: -1 }).limit(5).select("user total orderStatus createdAt");

    return res.status(200).json({status: true,message: "Dashboard data fetched successfully",
      totalOrders,
      totalRevenue,
      totalCustomers,
      inventoryNotifications,
      recentOrders,
    })
  } catch (error) {
    return res.status(500).json({status: false,message: error.message});
  }
}