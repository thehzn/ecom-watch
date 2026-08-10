import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
user: {type: mongoose.Schema.Types.ObjectId,ref: "user",required: true},

    items: [
      {
        product: {type: mongoose.Schema.Types.ObjectId,ref: "product", required: true},

        quantity: {type: Number,required: true,min: 1},

        price: {type: Number,required: true},
      },
    ],
    shippingMethod: {type: String, enum: ["Standard", "Express", "White Glove"], required: true},

    subtotal: {type: Number,required: true},

    shipping: {type: Number,default: 0},

    tax: {type: Number,default: 0},

    total: {type: Number,required: true},

   shippingAddress: {
     firstName: {type: String,required: true},
     
     lastName: {type: String,required: true},

      phone: {type: String,required: true},

      address: {type: String,required: true},

      city: {type: String,required: true},

      state: {type: String,required: true},

      pincode: {type: String,required: true},
    },
     paymentMethod: {type: String,  enum: ["Razorpay"],default: "Razorpay"},

     paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
     },
    razorpayOrderId: {type: String},

    razorpayPaymentId: {type: String},

    razorpaySignature: {type: String},

    orderStatus: {
      type: String,
      enum: ["Pending", "Shipped", "Cancelled", "Delivered"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  })

const Order = mongoose.model("order",orderSchema)
export default Order
