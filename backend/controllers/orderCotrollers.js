import Cart from "../models/CartModel.js";
import Order from "../models/OrderModel.js";
import razorpay from "../config/razorpay.js"
import crypto from "crypto"


export const createOrder = async ( req, res ) =>{
    try {
    const userId = req.user.id;

    const { shippingMethod, shippingAddress } = req.body;

    // 1. Validate shipping method
    if (!shippingMethod) {
      return res.status(400).json({status: false,message: "Shipping method is required"});
    }

    // 2. Validate shipping address
    if (!shippingAddress || !shippingAddress.firstName || !shippingAddress.lastName || !shippingAddress.phone || !shippingAddress.address || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
      return res.status(400).json({status: false,message: "Complete shipping address is required"});
    }

    // 3. Get user's cart
    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(404).json({status: false,message: "Cart is empty"});
    }

    // 4. Calculate subtotal and prepare order items
    let subtotal = 0;
    const orderItems = cart.items.map((item) => {
    if (!item.product) {
    throw new Error("A product in the cart no longer exists");
  }

  const price = item.product.price;

  subtotal += price * item.quantity;

  return {
    product: item.product._id,
    quantity: item.quantity,
    price
 };
});

    // 5. Shipping charge
    let shipping = 0;

    if (shippingMethod === "Standard") {
      shipping = 0;
    } else if (shippingMethod === "Express") {
      shipping = 500;
    } else if (shippingMethod === "White Glove") {
      shipping = 1000;
    }

    // 6. Tax
    const tax = 0;
    // 7. Total
    const total = subtotal + shipping + tax;
    // 8. Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: total * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    // 9. Save order in MongoDB
    const order = await Order.create({
      user: userId,
      items: orderItems,
      shippingMethod,
      subtotal,
      shipping,
      tax,
      total,
      shippingAddress,
      paymentMethod: "Razorpay",
      paymentStatus: "Pending",
      razorpayOrderId: razorpayOrder.id,
      orderStatus: "Pending",
    });

    // 10. Send response
    return res.status(201).json({ status: true, message: "Order created successfully",
      order,
      razorpayOrder: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
      razorpayKey: process.env.RAZORPAY_KEY_ID,
    });

  } catch (error) {
    return res.status(500).json({status: false, message: error.message,});
  }

}

export const verifyPayment = async (req, res) => {
   try {
    const userId = req.user.id;

    const {razorpay_order_id,razorpay_payment_id,razorpay_signature} = req.body;

    // 1. Validate payment details
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ status: false,  message: "Payment details are required"});
    }

    // 2. Generate signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    // 3. Verify signature
    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({status: false, message: "Payment verification failed"});
    }

    // 4. Find the order
    const order = await Order.findOne({
      razorpayOrderId: razorpay_order_id,
      user: userId,
    });

    if (!order) {
      return res.status(404).json({status: false, message: "Order not found"});
    }

    // 5. Update payment details
    order.paymentStatus = "Paid";
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;

    await order.save();
    // 6. Clear user's cart
    await Cart.findOneAndUpdate(
      { user: userId },
      { $set: { items: [] } }
    );

    // 7. Send response
    return res.status(200).json({status: true, message: "Payment verified and cart cleared successfully",order});

  } catch (error) {
    return res.status(500).json({status: false, message: error.message});
  }
}


export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.find({ user: userId }).populate("items.product").sort({ createdAt: -1 });

    return res.status(200).json({status: true,message: "Orders fetched successfully",orders});
  } catch (error) {
    return res.status(500).json({status: false,message: error.message});
  }
}


export const getSingleOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, user: userId}).populate("items.product");

    if (!order) {
      return res.status(404).json({ status: false,message: "Order not found"});
    }

    return res.status(200).json({status: true, message: "Order fetched successfully",order});
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message});
  }
}


export const cancelMyOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({
      _id: id,
      user: userId
    });

    if (!order) {
      return res.status(404).json({status: false,message: "Order not found"});
    }

    if (order.status === "Shipped" || order.status === "Delivered") {
      return res.status(400).json({status: false,message: "This order cannot be cancelled"});
    }

    order.status = "Cancelled";
    await order.save();

    return res.status(200).json({status: true,message: "Order cancelled successfully",order});

  } catch (error) {
    return res.status(500).json({status: false,message: error.message});
  }
}



//for admin 

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("user", "firstName lastName email phone").populate("items.product").sort({ createdAt: -1 });
    return res.status(200).json({status: true,message: "Orders fetched successfully",orders});
  } catch (error) {
    return res.status(500).json({status: false, message: error.message});
  }
}



export const getsingleOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate("user", "firstName lastName email phone").populate("items.product");

    if (!order) {
      return res.status(404).json({status: false,message: "Order not found"});
    }
    return res.status(200).json({status: true,message: "Order details fetched successfully",order});
  } catch (error) {
    return res.status(500).json({status: false,message: error.message});
  }
}


export const markAsShipped = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ status: false, message: "Order not found"});
    }

    if (order.orderStatus === "Cancelled") {
      return res.status(400).json({status: false,message: "Cancelled order cannot be marked as shipped"});
    }

    if (order.orderStatus === "Shipped") {
      return res.status(400).json({status: false,message: "Order is already shipped" });
    }

    order.orderStatus = "Shipped";
    await order.save();

    return res.status(200).json({status: true,message: "Order marked as shipped successfully",order});
  } catch (error) {
    return res.status(500).json({status: false,message: error.message,});
  }
}



export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({status: false,message: "Order not found"});
    }

    if (order.orderStatus === "Cancelled") {
      return res.status(400).json({status: false, message: "Order is already cancelled"});
    }

    if (order.orderStatus === "Shipped") {
      return res.status(400).json({status: false,message: "Shipped order cannot be cancelled"});
    }

    order.orderStatus = "Cancelled";
    await order.save();

    return res.status(200).json({status: true,message: "Order cancelled successfully",order});
  } catch (error) {
    return res.status(500).json({status: false,message: error.message});
  }
};


