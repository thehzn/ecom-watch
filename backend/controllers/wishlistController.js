import Wishlist from "../models/WishlistModel.js";
import Product from "../models/ProductModel.js";

export const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
    return res.status(404).json({status: false,message: "Product not found"});
    }

    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
    wishlist = await Wishlist.create({user: userId,products: [productId]});

    return res.status(201).json({status: true,message: "Product added to wishlist successfully",wishlist});
    }

    if (wishlist.products.includes(productId)) {
    return res.status(400).json({status: false,message: "Product already exists in wishlist"});
    }

    wishlist.products.push(productId);
    await wishlist.save();

    return res.status(200).json({status: true,message: "Product added to wishlist successfully",wishlist});
  } catch (error) {
    return res.status(500).json({status: false,message: error.message});
  }
}



export const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const wishlist = await Wishlist.findOne({ user: userId }).populate("products");

    if (!wishlist) {
      return res.status(200).json({ status: true, message: "Wishlist is empty", products: []});
    }

    return res.status(200).json({status: true,message: "Wishlist fetched successfully",products: wishlist.products});
  } catch (error) {
    return res.status(500).json({status: false,message: error.message});
  }
}



export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
    return res.status(404).json({status: false,message: "Wishlist not found"});
    }

    const productIndex = wishlist.products.findIndex((product) => product.toString() === productId);
    if (productIndex === -1) {
    return res.status(404).json({status: false,message: "Product not found in wishlist"});
    }

    wishlist.products.splice(productIndex, 1);
    await wishlist.save();

    return res.status(200).json({status: true,message: "Product removed from wishlist successfully",wishlist});
  } catch (error) {
    return res.status(500).json({status: false,message: error.message});
  }
}