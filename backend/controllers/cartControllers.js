import Cart from "../models/CartModel.js"
import Product from "../models/ProductModel.js"
import Newsletter from "../models/NewsletterModel.js";


export const addtoCart = async ( req, res ) =>{
    try {
        const userId  = req.user.id;
        const { ProductId, quantity } = req.body;

        if(!ProductId){
        return res.status(400).json({ status:false, message:"ProductId is invalid"})
        }
        const existingProduct = await Product.findById(ProductId)
        if(!existingProduct) return res.status(404).json({ status:false, message:"ProductId is not found"})
            let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            cart = new Cart({
                user: userId,
                items: [
                    {
                        product: ProductId,
                        quantity: quantity || 1
                    }
                ]
            });

            await cart.save();
           return res.status(201).json({status: true, message: "Product added to Cart successfully", cart});

        }

        const itemIndex = cart.items.findIndex((item) => item.product.toString() === ProductId);

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity || 1;
        } else {
            cart.items.push({
                product: ProductId,
                quantity: quantity || 1
            });
        }

        await cart.save();
        return res.status(200).json({status: true,message: "Cart updated successfully", cart});
    } catch (error) {
    return res.status(500).json({ status:false, message:error.message})       
    }
}


export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId })
      .populate("items.product");

    if (!cart) {
      return res.status(404).json({status: false,message: "Cart is empty"});
    }

    let subtotal = 0;

    cart.items.forEach((item) => {
      if (item.product) {
        subtotal += item.product.price * item.quantity;
      }
    });

    const subscriber = await Newsletter.findOne({user: userId});
    let discount = 0;

    if (subscriber) {
      discount = subtotal * 0.10;
    }

    const shipping = 0;
    const tax = 0;
    const total =subtotal - discount + shipping + tax;

    const itemCount = cart.items.reduce(
      (total, item) => total + item.quantity,0);

    return res.status(200).json({status: true,message: "Cart fetched successfully",cart,itemCount,
      orderSummary: {
        subtotal,
        discount,
        shipping,
        tax,
        total,
      },
    });

  } catch (error) {
    return res.status(500).json({status: false,message: error.message});
  }
}


export const updateCart = async (req, res) => {
    try {

        const userId = req.user.id;
        const { ProductId, quantity } = req.body;

        if (!ProductId || quantity < 1) {
        return res.status(400).json({status: false, message: "Product ID and valid quantity are required" });
        }

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
        return res.status(404).json({status: false,  message: "Cart not found"});
        }

        const itemIndex = cart.items.findIndex((item) => item.product.toString() === ProductId);

        if (itemIndex === -1) {
        return res.status(404).json({ status: false, message: "Product not found in cart" });
        }

        cart.items[itemIndex].quantity = quantity;

        await cart.save();
        return res.status(200).json({ status: true, message: "Cart updated successfully", cart });

    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
}


export const removeFromCart = async (req, res) => {
    try {

        const userId = req.user.id;
        const { ProductId } = req.params;

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
        return res.status(404).json({ status: false, message: "Cart not found"});
        }

        const itemIndex = cart.items.findIndex((item) => item.product.toString() === ProductId);

        if (itemIndex === -1) {
        return res.status(404).json({ status: false, message: "Product not found in cart" });
        }

        cart.items.splice(itemIndex, 1);
        await cart.save();
        return res.status(200).json({ status: true, message: "Product removed from cart successfully", cart});

    } catch (error) {
        return res.status(500).json({ status: false, message: error.message});
    }
}