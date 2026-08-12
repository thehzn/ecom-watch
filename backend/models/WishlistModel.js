import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    user: {type: mongoose.Schema.Types.ObjectId,ref: "user",required: true,unique: true},

    products: [
      {
        type: mongoose.Schema.Types.ObjectId,ref: "product",
      }
    ]
  },
  { timestamps: true }
);

const Wishlist = mongoose.model("wishlist", wishlistSchema);

export default Wishlist;