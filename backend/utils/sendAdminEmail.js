import Admin from "../models/AdminModel.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.email,
    pass: process.env.OTP_Password,
  },
});

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();


export const sendAdminOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(401).json({status: false, message: "Invalid Mail id",});
    }

    const adminOTP = generateOTP();

    admin.otp = adminOTP;
    admin.otpExpiresAt = Date.now() + 5 * 60 * 1000;

    await admin.save();

    await transporter.sendMail({
      from: process.env.email,
      to: email,
      subject: "Admin OTP Verification",
      html: `<h2>Your OTP: ${adminOTP}</h2> <p>Valid for 5 minutes</p>`,
    });

    return res.status(200).json({status: true, message: "OTP sent successfully",});

  } catch (error) {
    return res.status(500).json({status: false,message: error.message,});
  }
};