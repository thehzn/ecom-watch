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
// };
import User from "../models/UserModel.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Build the transporter once (outside the handler) so it's reused across requests
// instead of creating a fresh SMTP connection on every OTP send.
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
  connectionTimeout: 10000, // 10s to establish connection
  greetingTimeout: 10000,   // 10s to receive greeting after connect
  socketTimeout: 15000,     // 15s of inactivity before giving up
});

export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: false,
        message: "Email is required",
      });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
      console.error("Email credentials missing: EMAIL_USER / EMAIL_APP_PASSWORD not set");
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

    // Send the email FIRST. Only persist the OTP if delivery actually succeeds —
    // otherwise you end up with a valid OTP in the DB that the user never received.
    try {
      await transporter.sendMail({
        from: `"Chronos Haute Horlogerie" <${process.env.EMAIL_USER}>`,
        to: cleanEmail,
        subject: "Chronos Haute Horlogerie - Security OTP Verification",
        html: `
          <h2>Your Authentication OTP: <strong>${userOTP}</strong></h2>
          <p>This code is valid for 5 minutes.</p>
          <p>If you didn't request this, you can safely ignore this email.</p>
        `,
      });
    } catch (mailErr) {
      console.error("========== SMTP ERROR ==========");
      console.error("Message:", mailErr.message);
      console.error("Code:", mailErr.code);
      console.error("Command:", mailErr.command);
      console.error("Response:", mailErr.response);
      console.error("=================================");

      return res.status(502).json({
        status: false,
        message: "Failed to send OTP email. Please try again later.",
      });
    }

    // Only save the OTP once we know the email actually went out
    await User.collection.updateOne(
      { _id: user._id },
      {
        $set: {
          otp: userOTP,
          otpExpiresAt,
        },
      }
    );
    console.log(`\n========================================`);
    console.log(`  CHRONOS SECURITY OTP FOR: ${cleanEmail}`);
    console.log(`  OTP CODE: >>> ${userOTP} <<<`);
    console.log(`  VALID FOR 5 MINUTES`);
    console.log(`========================================\n`);
console.log("EMAIL configured:", !!process.env.email);
console.log("OTP Password configured:", !!process.env.OTP_Password);
if (process.env.email && process.env.OTP_Password) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.email,
        pass: process.env.OTP_Password,
      },
    });

    await transporter.sendMail({
      from: process.env.email,
      to: cleanEmail,
      subject: "Chronos Haute Horlogerie - Security OTP Verification",
      html: `<h2>Your Authentication OTP: <strong>${userOTP}</strong></h2>
             <p>This code is valid for 5 minutes.</p>`,
    });
  } catch (mailErr) {
    console.warn("SMTP Mail Error: " + mailErr.message);
  }
}

    // Never log the OTP itself in production — logs are often accessible
    // to teammates, log drains, or CI tools and this defeats the purpose of OTP.
    if (process.env.NODE_ENV !== "production") {
      console.log(`[DEV ONLY] OTP for ${cleanEmail}: ${userOTP}`);
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