// import User from "../models/UserModel.js";
// import nodemailer from "nodemailer";
// import dotenv from "dotenv";

// dotenv.config();

// const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// export const sendOTP = async (req, res) => {
//   try {
//     const { email } = req.body;
//     if (!email) {
//       return res.status(400).json({ status: false, message: "Email is required" });
//     }

//     const cleanEmail = email.toLowerCase().trim();
//     const user = await User.findOne({ email: cleanEmail, role: "user" });
//     if (!user) {
//       return res.status(401).json({ status: false, message: "Invalid Mail id" });
//     }

//     const userOTP = generateOTP();
//     const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

//     // Direct atomic update bypasses any schema validation errors on legacy accounts
//     await User.collection.updateOne(
//       { _id: user._id },
//       { $set: { otp: userOTP, otpExpiresAt } }
//     );

//     console.log(`\n========================================`);
//     console.log(`  CHRONOS SECURITY OTP FOR: ${cleanEmail}`);
//     console.log(`  OTP CODE: >>> ${userOTP} <<<`);
//     console.log(`  VALID FOR 5 MINUTES`);
//     console.log(`========================================\n`);

//     if (process.env.email && process.env.OTP_Password) {
//       try {
//         const transporter = nodemailer.createTransport({
//           service: "gmail",
//           auth: {
//             user: process.env.email,
//             pass: process.env.OTP_Password,
//           },
//         });

//         await transporter.sendMail({
//           from: process.env.email,
//           to: cleanEmail,
//           subject: "Chronos Haute Horlogerie - Security OTP Verification",
//           html: `<h2>Your Authentication OTP: <strong>${userOTP}</strong></h2> <p>This code is valid for 5 minutes.</p>`,
//         });
//       } catch (mailErr) {
//         console.warn("⚠️ SMTP Mail Error: " + mailErr.message);
//       }
//     }

//     return res.status(200).json({ status: true, message: "OTP sent successfully" });
//   } catch (error) {
//     console.error("sendOTP Error:", error);
//     return res.status(500).json({ status: false, message: error.message });
//   }
// };import User from "../models/UserModel.js";


import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: false,
        message: "Email is required",
      });
    }

    // Check Render environment variables
    console.log("EMAIL configured:", !!process.env.email);
    console.log("OTP Password configured:", !!process.env.OTP_Password);

    if (!process.env.email || !process.env.OTP_Password) {
      console.error("Email credentials are missing");

      return res.status(500).json({
        status: false,
        message: "Email configuration is missing on server",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: cleanEmail,
      role: "user",
    });

    if (!user) {
      return res.status(401).json({
        status: false,
        message: "Invalid Mail id",
      });
    }

    const userOTP = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.email,
        pass: process.env.OTP_Password,
      },
    });

    try {
      await transporter.sendMail({
        from: process.env.email,
        to: cleanEmail,
        subject: "Chronos Haute Horlogerie - Security OTP Verification",
        html: `
          <h2>Your Authentication OTP:
            <strong>${userOTP}</strong>
          </h2>
          <p>This code is valid for 5 minutes.</p>
          <p>If you didn't request this, you can safely ignore this email.</p>
        `,
      });

      console.log("✅ User OTP email sent successfully");
    } catch (mailErr) {
      console.error("========== SMTP ERROR ==========");
      console.error("Message:", mailErr.message);
      console.error("Code:", mailErr.code);
      console.error("Command:", mailErr.command);
      console.error("=================================");

      return res.status(502).json({
        status: false,
        message: "Failed to send OTP email. Please try again later.",
      });
    }

    // Save OTP only after email is successfully sent
    await User.collection.updateOne(
      { _id: user._id },
      {
        $set: {
          otp: userOTP,
          otpExpiresAt,
        },
      }
    );

    if (process.env.NODE_ENV !== "production") {
      console.log(`OTP for ${cleanEmail}: ${userOTP}`);
    }

    return res.status(200).json({
      status: true,
      message: "OTP sent successfully",
    });

  } catch (error) {
    console.error("sendOTP Error:", error);

    return res.status(500).json({
      status: false,
      message: "Something went wrong. Please try again.",
    });
  }
};