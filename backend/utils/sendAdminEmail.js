import Admin from "../models/AdminModel.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const sendAdminOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: false,
        message: "Email is required",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    const admin = await Admin.findOne({ email: cleanEmail });

    if (!admin) {
      return res.status(401).json({
        status: false,
        message: "Invalid Mail id",
      });
    }

    const adminOTP = generateOTP();

    admin.otp = adminOTP;
    admin.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await admin.save();

    console.log("========================================");
    console.log("CHRONOS ADMIN OTP");
    console.log("Email:", cleanEmail);
    console.log("OTP:", adminOTP);
    console.log("========================================");

    console.log("EMAIL configured:", !!process.env.email);
    console.log("OTP Password configured:", !!process.env.OTP_Password);

    if (!process.env.email || !process.env.OTP_Password) {
      return res.status(500).json({
        status: false,
        message: "Email configuration is missing on server",
      });
    }

    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.email,
          pass: process.env.OTP_Password,
        },
      });

      await transporter.sendMail({
        from: process.env.email,
        to: cleanEmail,
        subject: "Admin OTP Verification",
        html: `
          <h2>Your OTP: ${adminOTP}</h2>
          <p>Valid for 5 minutes</p>
        `,
      });

      console.log(" Admin OTP email sent successfully");

      return res.status(200).json({
        status: true,
        message: "OTP sent successfully",
      });

    } catch (mailErr) {
      console.error("========== ADMIN SMTP ERROR ==========");
      console.error("Message:", mailErr.message);
      console.error("Code:", mailErr.code);
      console.error("Command:", mailErr.command);
      console.error("======================================");

      return res.status(500).json({
        status: false,
        message: mailErr.message,
      });
    }

  } catch (error) {
    console.error("sendAdminOTP Error:", error);

    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};