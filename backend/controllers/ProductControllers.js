import Product from "../models/ProductModel.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

export const addProduct = async (req, res) => {
  try {
    const { modelName, sku, brand, modelNumber, category, productFor, price, stock, description, caseMaterial, glassType, strapBracelet } = req.body;

    if (!modelName || !sku || !brand || !modelNumber || !category || !price || !stock || !description) {
      return res.status(400).json({ status: false, message: "All required fields are required" });
    }

    if (!req.files?.mainImage) {
      return res.status(400).json({ status: false, message: "Main image is required" });
    }

    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) {
      return res.status(400).json({ status: false, message: "SKU already exists" });
    }

    let mainImageUrl = "";
    let imageUrls = [];

    const mainImageFile = req.files.mainImage[0];
    const mainImage = await cloudinary.uploader.upload(mainImageFile.path, {
      folder: "Products/MainImage",
    });
    mainImageUrl = mainImage.secure_url;

    if (fs.existsSync(mainImageFile.path)) {
      fs.unlinkSync(mainImageFile.path);
    }

    if (req.files.images && req.files.images.length > 0) {
      for (const file of req.files.images) {
        const uploadedImage = await cloudinary.uploader.upload(file.path, {
          folder: "Products/Images",
        });
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
      images: imageUrls,
    });

    return res.status(200).json({ status: true, message: "Product added successfully", product });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
}


export const getAllProducts = async (req, res) => {
  try {
    const { category, productFor, caseMaterial, search } = req.query;

    const filter = {};
    if (category && category !== "All") {
      const catLower = category.trim().toLowerCase();

      if (catLower === "luxury" || catLower === "luxury watch") {
        filter.category = "Luxury Watch";
      } 
      else if (catLower === "sports" || catLower === "sport") {
        filter.category = "Sports";
      } 
      else if (catLower === "heritage") {
        filter.category = "Heritage";
      } 
      else if (catLower === "contemporary") {
        filter.category = "Contemporary";
      }
    }
    if (productFor && productFor !== "All") {
      filter.productFor = productFor.trim();
    }
    if (caseMaterial && caseMaterial !== "All Materials") {
      filter.caseMaterial = caseMaterial.trim();
    }
    if (search && search.trim()) {
      const keyword = search.trim();
      filter.$or = [
        { modelName: { $regex: keyword, $options: "i" } },
        { brand: { $regex: keyword, $options: "i" } },
        { category: { $regex: keyword, $options: "i" } },
        { caseMaterial: { $regex: keyword, $options: "i" } },
        { productFor: { $regex: keyword, $options: "i" } },
        { modelNumber: { $regex: keyword, $options: "i" } },
        { sku: { $regex: keyword, $options: "i" } },
        { glassType: { $regex: keyword, $options: "i" } },
        { strapBracelet: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ];
    }
    const products = await Product.find(filter).sort({ _id: -1 });
    return res.status(200).json({status: true,message: "Products fetched successfully",products});

  } catch (error) {
    console.error("getAllProducts error:", error);

    return res.status(500).json({status: false,message: error.message});
  }
}


export const getSingleProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ status: false, message: "Product not found" });
    return res.status(200).json({ status: true, message: "Product fetched successfully", product });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { returnDocument: "after" });
    if (!updatedProduct) {
      return res.status(404).json({ status: false, message: "Product not found" });
    }
    return res.status(200).json({ status: true, message: "Product updated successfully", product: updatedProduct });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ status: false, message: "Product not found" });
    }
    await Product.findByIdAndDelete(id);
    return res.status(200).json({ status: true, message: "Product deleted successfully" });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
}

export const searchProducts = async (req, res) => {
  try {
    const { search } = req.query;
    if (!search || !search.trim()) {
      return res.status(400).json({status: false,message: "Search query is required"});
    }

    const keyword = search.trim();
    const products = await Product.find({
      $or: [
        { modelName: { $regex: keyword, $options: "i" } },
        { brand: { $regex: keyword, $options: "i" } },
        { category: { $regex: keyword, $options: "i" } },
        { productFor: { $regex: keyword, $options: "i" } },
        { caseMaterial: { $regex: keyword, $options: "i" } },
        { modelNumber: { $regex: keyword, $options: "i" } },
        { sku: { $regex: keyword, $options: "i" } },
        { glassType: { $regex: keyword, $options: "i" } },
        { strapBracelet: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ],
    }).sort({ _id: -1 });

    return res.status(200).json({status: true,message: "Products found successfully",products});

  } catch (error) {
    console.error("searchProducts error:", error);

    return res.status(500).json({status: false,message: error.message});
  }
}