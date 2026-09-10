import Admin from "../models/AdminModel.js";
import argon from "argon2"
import jwt from "jsonwebtoken"
import User from "../models/UserModel.js"

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const Adminlogin = async (req, res) => {
  try {
    const { email, password, captchaToken } = req.body;
    if (!captchaToken) {
      return res.status(400).json({ status: false, message: "Please complete the reCAPTCHA" });
    }

    // VERIFY RECAPTCHA WITH GOOGLE
    const captchaResponse = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: captchaToken,
        }),
      }
    );

    const captchaResult = await captchaResponse.json();

    if (!captchaResult.success) {
      return res.status(400).json({
        status: false,
        message: "reCAPTCHA verification failed. Please try again.",
      });
    }
    if (!email || !password) {
      return res.status(400).json({
        status: false,
        message: "All fields must be filled",
      });
    }

    const currentAdmin = await Admin.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!currentAdmin) {
      return res.status(400).json({status: false,message: "Invalid User or Password"});
    }

    const isMatch = await argon.verify(currentAdmin.password, password);

    if (!isMatch) {
      return res.status(400).json({
        status: false,
        message: "Invalid Password",
      });
    }

    const AdminToken = jwt.sign(
      {
        id: currentAdmin._id,
        role: "admin",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      status: true,
      message: "Successfully Loggedin",
      token: AdminToken,
      user: {
        email: currentAdmin.email,
        role: "admin",
      },
    });
  } catch (error) {
    console.error("ADMIN LOGIN ERROR:", error);

    return res.status(500).json({status: false,message: error.message});
  }
};


export const verifyAdminOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const admin = await Admin.findOne({ email });

    if (!admin) {
    return res.status(401).json({ status: false,message: "Invalid Admin" });
    }

    if (admin.otp !== otp) {
      return res.status(400).json({ status: false, message: "OTP is invalid" });
    }

    if (admin.otpExpiresAt < Date.now()) {
      return res.status(400).json({ status: false, message: "OTP is expired" });
    }

    admin.otp = null;
    admin.otpExpiresAt = null;

    await admin.save();

    const resetToken = jwt.sign( { id: admin._id, purpose: "reset" }, process.env.JWT_SECRET, { expiresIn: "10m" });

    return res.status(200).json({ status: true, message: "OTP Verified", resetToken });

  } catch (error) {
    return res.status(500).json({ status: false,message: error.message });
  }
};


export const resetAdminPassword = async (req, res) => {
  try {
    const { resetToken, password, confirmPassword } = req.body;

    if (!resetToken || !password || !confirmPassword) {
      return res.status(400).json({ status: false, message: "All fields are required"});
    }

    if (password !== confirmPassword) {
      return res.status(400).json({status: false,message: "Passwords do not match" });
    }

    const passwordRegex =/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({status: false,message:  "Password must be at least 8 characters and contain uppercase, lowercase, number and special character."});
    }

    const decoded = jwt.verify( resetToken,  process.env.JWT_SECRET );

    if (decoded.purpose !== "reset") {
      return res.status(400).json({ status: false,message: "Invalid token"});
    }

    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(404).json({status: false,message: "Admin not found"});
    }

    admin.password = await argon.hash(password);

    await admin.save();

    return res.status(200).json({status: true,message: "Admin password updated successfully" });

  } catch (error) {
    return res.status(500).json({status: false, message: error.message });
  }
};



export const sendAdminEmailChangeOTP = async (req, res) => {
  try {
    const { newEmail } = req.body;

    if (!newEmail) {
      return res.status(400).json({
        status: false,
        message: "New email is required",
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

    const cleanEmail = newEmail.toLowerCase().trim();

    // Check whether this email is already used
    const existingAdmin = await Admin.findOne({
      email: cleanEmail,
    });

    if (existingAdmin) {
      return res.status(400).json({
        status: false,
        message: "This email is already registered",
      });
    }

    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        status: false,
        message: "This email is already registered",
      });
    }

    const adminOTP = generateOTP();

    const otpExpiresAt = new Date(
      Date.now() + 5 * 60 * 1000
    );

    // Send OTP to the NEW email using Brevo
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
          subject: "Chronos - Email Change Verification",
          htmlContent: `
            <h2>Your Email Change OTP</h2>

            <h1>${adminOTP}</h1>

            <p>This OTP is valid for 5 minutes.</p>

            <p>
              If you did not request an email change,
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

    console.log("Admin email change OTP sent successfully");
    console.log("Brevo message ID:", data.messageId);

    // Store OTP temporarily on the logged-in admin
    const admin = await Admin.findById(req.user.id);

    if (!admin) {
      return res.status(404).json({
        status: false,
        message: "Admin not found",
      });
    }

    await Admin.collection.updateOne(
      { _id: admin._id },
      {
        $set: {
          otp: adminOTP,
          otpExpiresAt,
          pendingEmail: cleanEmail,
        },
      }
    );

    return res.status(200).json({
      status: true,
      message: "OTP sent successfully to the new email",
    });

  } catch (error) {
    console.error("sendAdminEmailChangeOTP Error:", error);

    return res.status(500).json({
      status: false,
      message: "Something went wrong. Please try again.",
    });
  }
};



export const verifyAdminEmailChangeOTP = async (req, res) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({
        status: false,
        message: "OTP is required",
      });
    }

    const admin = await Admin.findById(req.user.id);

    if (!admin) {
      return res.status(404).json({
        status: false,
        message: "Admin not found",
      });
    }

    if (!admin.pendingEmail) {
      return res.status(400).json({
        status: false,
        message: "No email change request found",
      });
    }

    if (!admin.otp) {
      return res.status(400).json({
        status: false,
        message: "OTP is invalid",
      });
    }

    if (admin.otpExpiresAt < Date.now()) {
      return res.status(400).json({
        status: false,
        message: "OTP is expired",
      });
    }

    if (admin.otp !== otp.toString()) {
      return res.status(400).json({
        status: false,
        message: "OTP is invalid",
      });
    }

    // Change email only after successful OTP verification
    admin.email = admin.pendingEmail;

    // Clear temporary OTP data
    admin.otp = null;
    admin.otpExpiresAt = null;
    admin.pendingEmail = null;

    await admin.save();

    return res.status(200).json({
      status: true,
      message: "Admin email changed successfully",
      email: admin.email,
    });

  } catch (error) {
    console.error("verifyAdminEmailChangeOTP Error:", error);

    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};