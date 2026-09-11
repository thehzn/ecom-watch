import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

import Product from "./models/ProductModel.js";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const products = [
    {
        sku: "CHR-LUX-M-001",
        image: "sovereign-tourbillon.jpg",
    },
    {
        sku: "CHR-LUX-W-002",
        image: "celestia-diamond.jpg",
    },
    {
        sku: "CHR-LUX-C-003",
        image: "little-moonphase.jpg",
    },
    {
        sku: "CHR-HER-M-004",
        image: "vintage-1957.jpg",
    },
    {
        sku: "CHR-HER-W-005",
        image: "classic-rectangulaire.jpg",
    },
    {
        sku: "CHR-HER-C-006",
        image: "junior-classic.jpg",
    },
    {
        sku: "CHR-SPT-M-007",
        image: "speedmaster-professional.jpg",
    },
    {
        sku: "CHR-SPT-W-008",
        image: "aquaracer-chronograph.jpg",
    },
    {
        sku: "CHR-SPT-C-009",
        image: "junior-explorer.jpg",
    },
    {
        sku: "CHR-CON-M-010",
        image: "prx-automatic.jpg",
    },
    {
        sku: "CHR-CON-W-011",
        image: "archi-minimal.jpg",
    },
    {
        sku: "CHR-CON-C-012",
        image: "little-geometry.jpg",
    },
];

const updateProductImages = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);

        console.log("✅ MongoDB connected\n");

        const imageFolder = path.join(
            process.cwd(),
            "uploads",
            "products"
        );

        for (const product of products) {
            const imagePath = path.join(
                imageFolder,
                product.image
            );

            console.log(`Uploading: ${product.image}`);

            const uploadedImage = await cloudinary.uploader.upload(
                imagePath,
                {
                    folder: "Products/MainImage",
                }
            );

            const updatedProduct = await Product.findOneAndUpdate(
                { sku: product.sku },
                {
                    $set: {
                        mainImage: uploadedImage.secure_url,
                    },
                },
                {
                    new: true,
                }
            );

            if (!updatedProduct) {
                console.log(`❌ Product not found: ${product.sku}`);
                continue;
            }

            console.log(
                `✅ ${updatedProduct.modelName} → image updated`
            );
            console.log("");
        }

        console.log("🎉 ALL PRODUCT IMAGES UPDATED!");

    } catch (error) {
        console.error("❌ Image update failed:");
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

updateProductImages();