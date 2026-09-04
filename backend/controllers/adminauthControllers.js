import Admin from "../models/AdminModel.js";
import argon from "argon2"
import jwt from "jsonwebtoken"


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