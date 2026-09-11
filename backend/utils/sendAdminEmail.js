import Admin from "../models/AdminModel.js";
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

    if (
      !process.env.BREVO_API_KEY ||
      !process.env.BREVO_SENDER_EMAIL
    ) {
      console.error("Brevo API configuration is missing");

      return res.status(500).json({
        status: false,
        message: "Email configuration is missing on server",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    const admin = await Admin.findOne({
      email: cleanEmail,
    });

    if (!admin) {
      return res.status(401).json({
        status: false,
        message: "Invalid Mail id",
      });
    }

    const adminOTP = generateOTP();

    const otpExpiresAt = new Date(
      Date.now() + 5 * 60 * 1000
    );

    const response = await fetch(
      "https://api.brevo.com/v3/smtp/email",
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "api-key": process.env.BREVO_API_KEY,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sender: {
            name: "Chronos Haute Horlogerie",
            email: process.env.BREVO_SENDER_EMAIL,
          },
          to: [
            {
              email: cleanEmail,
            },
          ],
          subject: "Chronos - Admin OTP Verification",
          htmlContent: `
            <h2>Your Admin OTP</h2>

            <h1>${adminOTP}</h1>

            <p>This OTP is valid for 5 minutes.</p>

            <p>
              If you did not request a password reset,
              please ignore this email.
            </p>
          `,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("========== BREVO API ERROR ==========");
      console.error(data);
      console.error("=====================================");

      return res.status(502).json({
        status: false,
        message: "Failed to send OTP email",
      });
    }

    // Save OTP only after Brevo accepts the email
    admin.otp = adminOTP;
    admin.otpExpiresAt = otpExpiresAt;

    await admin.save();

    console.log("Admin OTP email sent successfully");
    console.log("Brevo message ID:", data.messageId);

    return res.status(200).json({
      status: true,
      message: "OTP sent successfully",
    });

  } catch (error) {
    console.error("sendAdminOTP Error:", error);

    return res.status(500).json({
      status: false,
      message: "Something went wrong. Please try again.",
    });
  }
}