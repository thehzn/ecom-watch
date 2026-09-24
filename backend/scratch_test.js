import mongoose from "mongoose";
import dotenv from "dotenv";
import argon from "argon2";
import Admin from "./models/AdminModel.js";

dotenv.config();

async function run() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB!");

    const admins = await Admin.find({});
    console.log(`Found ${admins.length} admin(s):`);
    for (const a of admins) {
      console.log("- ID:", a._id, "Email:", a.email, "GoogleId:", a.googleId, "Password hash:", a.password?.substring(0, 20));
    }

    if (admins.length > 0) {
      const admin = admins[0];
      console.log("Testing password verify for Admin@1234...");
      try {
        const match = await argon.verify(admin.password, "Admin@1234");
        console.log("Password Admin@1234 match result:", match);
      } catch (err) {
        console.log("Argon verify error:", err.message);
      }
    }
  } catch (err) {
    console.error("Test error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

run();
