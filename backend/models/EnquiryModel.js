import mongoose from "mongoose";

const enquirySchema = new mongoose.Schema(
  {
    user: {type: mongoose.Schema.Types.ObjectId, ref: "user"},

    name: {type: String,required: true},

    email: {type: String,required: true},

    subject: {type: String,required: true},

    message: {type: String,required: true},

    status: {type: String,enum: ["Pending", "Resolved"],default: "Pending"}
  },
  {
    timestamps: true
  }
);

const Enquiry = mongoose.model("enquiry", enquirySchema);

export default Enquiry;