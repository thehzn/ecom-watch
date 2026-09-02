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
};

export const getAllProducts = async (req, res) => {
  try {
    const { category, productFor, caseMaterial, search } = req.query;
    const filter = {};

    if (category && category !== 'All') {
      const catLower = category.toLowerCase().trim();
      if (catLower === 'luxury' || catLower === 'luxury watch') {
        filter.category = { $regex: /luxury/i };
      } else if (catLower === 'sport') {
        filter.category = { $regex: /sport|contemporary/i };
      } else if (catLower === 'heritage') {
        filter.category = { $regex: /heritage/i };
      } else if (catLower === 'contemporary') {
        filter.category = { $regex: /contemporary|sport/i };
      } else {
        filter.category = { $regex: new RegExp(category, 'i') };
      }
    }

    if (productFor && productFor !== 'All') {
      filter.productFor = productFor;
    }

    if (caseMaterial && caseMaterial !== 'All Materials') {
      filter.caseMaterial = caseMaterial;
    }

    if (search) {
      filter.$or = [
        { modelName: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { caseMaterial: { $regex: search, $options: 'i' } },
      ];
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ status: true, message: "Products fetched successfully", products });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

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
};
