import mongoose from "mongoose";

const newsletterSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      unique: true
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"]
    }
  },
  { timestamps: true }
);

const Newsletter = mongoose.model("newsletter", newsletterSchema);

export default Newsletter;