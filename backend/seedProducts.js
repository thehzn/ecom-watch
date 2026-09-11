import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
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
        modelName: "Sovereign Tourbillon",
        sku: "CHR-LUX-M-001",
        brand: "CHRONOS",
        modelNumber: "CT-1801",
        category: "Luxury Watch",
        productFor: "Men",
        price: 7800000,
        stock: 4,
        description:
            "A commanding haute horlogerie timepiece pairing an open-worked tourbillon with an 18K rose-gold case and hand-finished details.",
        caseMaterial: "18K Rose Gold",
        glassType: "Sapphire Crystal",
        strapBracelet: "Alligator Leather",
        image: "sovereign-tourbillon.jpg",
    },

    {
        modelName: "Celestia Diamond",
        sku: "CHR-LUX-W-002",
        brand: "CHRONOS",
        modelNumber: "CD-3602",
        category: "Luxury Watch",
        productFor: "Women",
        price: 6400000,
        stock: 3,
        description:
            "An elegant jewel-set creation with a luminous dial, diamond-set case and bracelet, and a refined automatic movement.",
        caseMaterial: "18K White Gold",
        glassType: "Sapphire Crystal",
        strapBracelet: "Diamond-set Gold Bracelet",
        image: "celestia-diamond.jpg",
    },

    {
        modelName: "Little Moonphase",
        sku: "CHR-LUX-C-003",
        brand: "CHRONOS",
        modelNumber: "LM-3203",
        category: "Luxury Watch",
        productFor: "Children",
        price: 950000,
        stock: 5,
        description:
            "A petite celestial watch designed for young collectors, featuring a moonphase-inspired dial and polished precious-metal case.",
        caseMaterial: "18K Gold",
        glassType: "Sapphire Crystal",
        strapBracelet: "Navy Leather",
        image: "little-moonphase.jpg",
    },

    {
        modelName: "Vintage 1957",
        sku: "CHR-HER-M-004",
        brand: "CHRONOS",
        modelNumber: "VH-4004",
        category: "Heritage",
        productFor: "Men",
        price: 890000,
        stock: 8,
        description:
            "A timeless dress watch inspired by mid-century proportions, with a warm ivory dial and traditional leather strap.",
        caseMaterial: "Stainless Steel",
        glassType: "Domed Sapphire Crystal",
        strapBracelet: "Brown Leather",
        image: "vintage-1957.jpg",
    },

    {
        modelName: "Classic Rectangulaire",
        sku: "CHR-HER-W-005",
        brand: "CHRONOS",
        modelNumber: "CR-2805",
        category: "Heritage",
        productFor: "Women",
        price: 680000,
        stock: 7,
        description:
            "A graceful rectangular silhouette that blends vintage elegance with contemporary finishing for formal and everyday wear.",
        caseMaterial: "Stainless Steel",
        glassType: "Sapphire Crystal",
        strapBracelet: "Two-tone Steel Bracelet",
        image: "classic-rectangulaire.jpg",
    },

    {
        modelName: "Junior Classic",
        sku: "CHR-HER-C-006",
        brand: "CHRONOS",
        modelNumber: "JC-3006",
        category: "Heritage",
        productFor: "Children",
        price: 320000,
        stock: 10,
        description:
            "A friendly heritage-inspired design with a compact case and playful dial details for younger collectors.",
        caseMaterial: "Stainless Steel",
        glassType: "Mineral Crystal",
        strapBracelet: "Brown Leather",
        image: "junior-classic.jpg",
    },

    {
        modelName: "Speedmaster Professional",
        sku: "CHR-SPT-M-007",
        brand: "CHRONOS",
        modelNumber: "SP-4207",
        category: "Sports",
        productFor: "Men",
        price: 820000,
        stock: 9,
        description:
            "A performance-focused chronograph with a high-contrast dial, robust steel case, and precise manually wound movement.",
        caseMaterial: "Stainless Steel",
        glassType: "Sapphire Crystal",
        strapBracelet: "Stainless Steel Bracelet",
        image: "speedmaster-professional.jpg",
    },

    {
        modelName: "AquaRacer Chronograph",
        sku: "CHR-SPT-W-008",
        brand: "CHRONOS",
        modelNumber: "AC-3608",
        category: "Sports",
        productFor: "Women",
        price: 590000,
        stock: 11,
        description:
            "A versatile sport chronograph built around a compact case, luminous markers, and a water-ready steel bracelet.",
        caseMaterial: "Stainless Steel",
        glassType: "Sapphire Crystal",
        strapBracelet: "Stainless Steel Bracelet",
        image: "aquaracer-chronograph.jpg",
    },

    {
        modelName: "Junior Explorer",
        sku: "CHR-SPT-C-009",
        brand: "CHRONOS",
        modelNumber: "JE-3409",
        category: "Sports",
        productFor: "Children",
        price: 12000,
        stock: 18,
        description:
            "A rugged junior sports watch with a bold black-and-blue dial, durable resin construction, and easy-to-read display.",
        caseMaterial: "Resin",
        glassType: "Mineral Crystal",
        strapBracelet: "Black Resin",
        image: "junior-explorer.jpg",
    },

    {
        modelName: "PRX Automatic",
        sku: "CHR-CON-M-010",
        brand: "CHRONOS",
        modelNumber: "PA-4010",
        category: "Contemporary",
        productFor: "Men",
        price: 77500,
        stock: 12,
        description:
            "A clean integrated-bracelet design defined by geometric case lines, a restrained black dial, and an automatic movement.",
        caseMaterial: "Stainless Steel",
        glassType: "Sapphire Crystal",
        strapBracelet: "Integrated Steel Bracelet",
        image: "prx-automatic.jpg",
    },

    {
        modelName: "Archi Minimal",
        sku: "CHR-CON-W-011",
        brand: "CHRONOS",
        modelNumber: "AM-3411",
        category: "Contemporary",
        productFor: "Women",
        price: 65000,
        stock: 14,
        description:
            "A minimalist architectural watch built around a slim profile, warm metallic tones, and a clean uninterrupted dial.",
        caseMaterial: "Stainless Steel",
        glassType: "Mineral Crystal",
        strapBracelet: "Rose-gold Mesh",
        image: "archi-minimal.jpg",
    },

    {
        modelName: "Little Geometry",
        sku: "CHR-CON-C-012",
        brand: "CHRONOS",
        modelNumber: "LG-3012",
        category: "Contemporary",
        productFor: "Children",
        price: 22000,
        stock: 16,
        description:
            "A playful modern watch with geometric styling, a soft pastel palette, and lightweight compact construction.",
        caseMaterial: "Stainless Steel",
        glassType: "Mineral Crystal",
        strapBracelet: "Lilac Leather",
        image: "little-geometry.jpg",
    },
];

const seedProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);

        console.log("MongoDB connected");

        const imageFolder = path.join(
            process.cwd(),
            "uploads",
            "products"
        );

        for (const productData of products) {
            const imagePath = path.join(
                imageFolder,
                productData.image
            );

            console.log(`Uploading ${productData.image}...`);

            const uploadedImage = await cloudinary.uploader.upload(
                imagePath,
                {
                    folder: "Products/MainImage",
                }
            );

            const product = {
                modelName: productData.modelName,
                sku: productData.sku,
                brand: productData.brand,
                modelNumber: productData.modelNumber,
                category: productData.category,
                productFor: productData.productFor,
                price: productData.price,
                stock: productData.stock,
                description: productData.description,
                caseMaterial: productData.caseMaterial,
                glassType: productData.glassType,
                strapBracelet: productData.strapBracelet,
                mainImage: uploadedImage.secure_url,
                images: [],
            };

            await Product.findOneAndUpdate(
                { sku: product.sku },
                product,
                {
                    upsert: true,
                    new: true,
                }
            );

            console.log(`✓ ${product.modelName} added`);
        }

        console.log("\n🎉 All 12 products added successfully!");

    } catch (error) {
        console.error("❌ Product seeding failed:");
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

seedProducts();