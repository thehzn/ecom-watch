import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Product from "./models/ProductModel.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

const priceUpdates = [
  { sku: "CHR-LUX-M-001", price: 380000 }, // Sovereign Tourbillon (₹3,80,000)
  { sku: "CHR-LUX-W-002", price: 320000 }, // Celestia Diamond (₹3,20,000)
  { sku: "CHR-LUX-C-003", price: 95000 },  // Little Moonphase (₹95,000)
  { sku: "CHR-HER-M-004", price: 89000 },  // Vintage 1957 (₹89,000)
  { sku: "CHR-HER-W-005", price: 68000 },  // Classic Rectangulaire (₹68,000)
  { sku: "CHR-HER-C-006", price: 32000 },  // Junior Classic (₹32,000)
  { sku: "CHR-SPT-M-007", price: 82000 },  // Speedmaster Professional (₹82,000)
  { sku: "CHR-SPT-W-008", price: 59000 },  // AquaRacer Chronograph (₹59,000)
  { sku: "CHR-SPT-C-009", price: 12000 },  // Junior Explorer (₹12,000)
  { sku: "CHR-CON-M-010", price: 77500 },  // PRX Automatic (₹77,500)
  { sku: "CHR-CON-W-011", price: 65000 },  // Archi Minimal (₹65,000)
  { sku: "CHR-CON-C-012", price: 22000 },  // Little Geometry (₹22,000)
];

async function updatePrices() {
  try {
    const mongoUrl = process.env.MONGO_URL;
    if (!mongoUrl) {
      throw new Error("MONGO_URL not found in .env");
    }

    await mongoose.connect(mongoUrl);
    console.log("Connected to MongoDB.");

    for (const item of priceUpdates) {
      const res = await Product.updateOne({ sku: item.sku }, { $set: { price: item.price } });
      if (res.matchedCount > 0) {
        console.log(`Updated ${item.sku} price to ₹${item.price}`);
      }
    }

    // Also cap any other products in DB that exceed ₹4,50,000
    const overLimitProducts = await Product.find({ price: { $gt: 450000 } });
    for (const p of overLimitProducts) {
      const newPrice = Math.min(Math.round(p.price / 10), 350000);
      await Product.updateOne({ _id: p._id }, { $set: { price: newPrice } });
      console.log(`Capped ${p.modelName} (${p.sku}) from ₹${p.price} to ₹${newPrice}`);
    }

    console.log("Price adjustment completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Error adjusting prices:", err.message);
    process.exit(1);
  }
}

updatePrices();
