import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Product from "./models/ProductModel.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

const skusToRemove = [
  "CHR-LUX-001",
  "CHR-LUX-002",
  "CHR-HER-001",
  "CHR-HER-002",
  "CHR-CNT-001",
  "CHR-CNT-002",
  "CHR-SPT-001",
  "CHR-SPT-002"
];

async function cleanup() {
  try {
    const mongoUrl = process.env.MONGO_URL;
    if (!mongoUrl) {
      throw new Error("MONGO_URL missing in backend/.env");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUrl);

    const res = await Product.deleteMany({ sku: { $in: skusToRemove } });
    console.log(`Successfully deleted ${res.deletedCount} seeded products from database.`);

    process.exit(0);
  } catch (err) {
    console.error("Cleanup error:", err.message);
    process.exit(1);
  }
}

cleanup();
