import Product from "../models/ProductModel.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

export const addProduct = async (req, res) => {
    try {

        const { modelName, sku, brand, modelNumber, category, productFor, price, stock, description, caseMaterial, glassType, strapBracelet } = req.body;

        if ( !modelName || !sku || !brand || !modelNumber || !category || !price || !stock || !description ) {
        return res.status(400).json({ status: false, message: "All required fields are required" });
        }

        if (!req.files?.mainImage) {
        return res.status(400).json({ status: false, message: "Main image is required"});
        }

        const existingProduct = await Product.findOne({ sku });

        if (existingProduct) {
            return res.status(400).json({ status: false,message: "SKU already exists" });
        }
        let mainImageUrl = "";
        let imageUrls = [];

        const mainImageFile = req.files.mainImage[0];
        console.log(mainImageFile);

        const mainImage = await cloudinary.uploader.upload(
            mainImageFile.path,
            {
                folder: "Products/MainImage"
            }
        );

        mainImageUrl = mainImage.secure_url;

        if (fs.existsSync(mainImageFile.path)) {
            fs.unlinkSync(mainImageFile.path);
        }

        if (req.files.images && req.files.images.length > 0) {

            for (const file of req.files.images) {

                const uploadedImage = await cloudinary.uploader.upload(
                    file.path,
                    {
                        folder: "Products/Images"
                    }
                );

                imageUrls.push(uploadedImage.secure_url);

                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            }
        }

        const product = await Product.create({
            modelName,
            sku,
            brand,
            modelNumber,
            category,
            productFor,
            price,
            stock,
            description,
            caseMaterial,
            glassType,
            strapBracelet,
            mainImage: mainImageUrl,
            images: imageUrls
        });

        return res.status(200).json({ status: true, message: "Product added successfully",  product });

    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
}

export const getAllProducts = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 12);

    const { category, productFor, caseMaterial } = req.query;

    const filter = {};

    if (category) filter.category = category;
    if (productFor) filter.productFor = productFor;
    if (caseMaterial) filter.caseMaterial = caseMaterial;

    const skip = (page - 1) * limit;

    const products = await Product.find(filter) .sort({ createdAt: -1 }).skip(skip).limit(limit);
    const totalProducts = await Product.countDocuments(filter);

    return res.status(200).json({ status: true, message: "Products fetched successfully", products,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
      totalProducts
    });

  } catch (error) {
    return res.status(500).json({ status: false, message: error.message,});
  }
}


export const getSingleProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) return res.status(404).json({ status: false, message: "Product not found"});

    return res.status(200).json({status: true, message: "Product fetched successfully", product});
  } catch (error) {
    return res.status(500).json({status: false, message: error.message });
  }
}



export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body,{ returnDocument: "after" });

    if (!updatedProduct) {
      return res.status(404).json({status: false,message: "Product not found" });
    }

    return res.status(200).json({ status: true, message: "Product updated successfully", product: updatedProduct});
  } catch (error) {
    return res.status(500).json({status: false, message: error.message });
  }
}


export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found"});
    }

    await Product.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Product deleted successfully"});
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}


export const searchProducts = async (req, res) => {
  try {
    const { search } = req.query;
    const products = await Product.find({
      $or: [
        { category: { $regex: search, $options: "i" } },
        { productFor: { $regex: search, $options: "i" } }
      ]
    });

    return res.status(200).json({ status: true, products});

  } catch (error) {
    return res.status(500).json({status: false,message: error.message});
  }
};