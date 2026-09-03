import dotenv from "dotenv";
import User from "../models/UserModel.js";

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

    const otpExpiresAt = new Date(
      Date.now() + 5 * 60 * 1000
    );

    // Send email using Brevo REST API
    const response = await fetch(
      "https://api.brevo.com/v3/smtp/email",
      {
        method: "POST",
        headers: {
          "accept": "application/json",
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
          subject:
            "Chronos Haute Horlogerie - Security OTP Verification",
          htmlContent: `
            <h2>Your Authentication OTP:
              <strong>${userOTP}</strong>
            </h2>

            <p>This code is valid for 5 minutes.</p>

            <p>
              If you didn't request this, you can safely ignore this email.
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

    console.log("✅ User OTP email sent successfully");
    console.log("Brevo message ID:", data.messageId);

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