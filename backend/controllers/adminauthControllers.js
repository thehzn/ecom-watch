import Admin from "../models/AdminModel.js";
import argon from "argon2";
import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
import crypto from "crypto";
import { parseUserAgent, getClientIp } from "../utils/deviceParser.js";

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Password Policy: At least 12 characters, uppercase, lowercase, number, special character
const ADMIN_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{12,}$/;

const getPasswordExpiryData = (admin) => {
  const passwordChangedAt =
    admin.passwordChangedAt || admin.createdAt || new Date();
  const daysSinceChange = Math.floor(
    (Date.now() - new Date(passwordChangedAt).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const daysRemaining = Math.max(0, 90 - daysSinceChange);
  const isExpired = daysSinceChange >= 90;
  const expiresSoon = daysRemaining <= 14;

  return {
    passwordChangedAt,
    daysSinceChange,
    daysRemaining,
    isExpired,
    expiresSoon,
    policy: "Passwords must be at least 12 characters and changed every 90 days",
  };
};

export const Adminlogin = async (req, res) => {
  try {
    const { email, password, captchaToken } = req.body;
    if (!captchaToken) {
      return res
        .status(400)
        .json({ status: false, message: "Please complete the reCAPTCHA" });
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

    const userAgent = req.headers["user-agent"] || "";
    const { device, browser, os, deviceType } = parseUserAgent(userAgent);
    const ipAddress = getClientIp(req);

    const currentAdmin = await Admin.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!currentAdmin) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid User or Password" });
    }

    // Check account lockout
    if (
      currentAdmin.lockUntil &&
      new Date(currentAdmin.lockUntil).getTime() > Date.now()
    ) {
      const minutesLeft = Math.ceil(
        (new Date(currentAdmin.lockUntil).getTime() - Date.now()) / (60 * 1000)
      );
      return res.status(403).json({
        status: false,
        message: `Account temporarily locked due to multiple failed attempts. Please try again in ${minutesLeft} minute(s).`,
      });
    }

    let isMatch = false;
    try {
      isMatch = await argon.verify(currentAdmin.password, password);
    } catch (verifyErr) {
      console.error("Argon verify error:", verifyErr.message);
      isMatch = false;
    }

    if (!isMatch) {
      // Record failed attempt and calculate suspicious activity
      currentAdmin.failedLoginAttempts =
        (currentAdmin.failedLoginAttempts || 0) + 1;
      const isSuspicious = currentAdmin.failedLoginAttempts >= 3;
      const suspiciousReason = isSuspicious
        ? `Multiple failed attempts (${currentAdmin.failedLoginAttempts})`
        : null;

      if (currentAdmin.failedLoginAttempts >= 5) {
        currentAdmin.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 min lock
      }

      if (!Array.isArray(currentAdmin.loginActivity)) {
        currentAdmin.loginActivity = [];
      }

      currentAdmin.loginActivity.unshift({
        ipAddress,
        userAgent,
        device,
        browser,
        os,
        status: "FAILED",
        failureReason: "Invalid Password",
        isSuspicious,
        suspiciousReason,
        timestamp: new Date(),
      });

      if (currentAdmin.loginActivity.length > 50) {
        currentAdmin.loginActivity = currentAdmin.loginActivity.slice(0, 50);
      }

      currentAdmin.markModified("loginActivity");
      await currentAdmin.save();

      return res.status(400).json({
        status: false,
        message: "Invalid Password",
      });
    }

    // Successful login: evaluate suspicious criteria
    const previousSuccessfulIps = (currentAdmin.loginActivity || [])
      .filter((act) => act.status === "SUCCESS")
      .map((act) => act.ipAddress);

    const isNewIp =
      previousSuccessfulIps.length > 0 &&
      !previousSuccessfulIps.includes(ipAddress);
    const hadFailedAttempts = (currentAdmin.failedLoginAttempts || 0) >= 2;

    const isSuspicious = isNewIp || hadFailedAttempts;
    let suspiciousReason = null;
    if (hadFailedAttempts) {
      suspiciousReason = `Login succeeded after ${currentAdmin.failedLoginAttempts} failed attempts`;
    } else if (isNewIp) {
      suspiciousReason = `Unrecognized IP address detected (${ipAddress})`;
    }

    // Reset failed attempts & lockout
    currentAdmin.failedLoginAttempts = 0;
    currentAdmin.lockUntil = null;

    // Create a new session
    const sessionId = crypto.randomUUID();
    const newSession = {
      sessionId,
      device,
      browser,
      os,
      deviceType,
      ipAddress,
      lastActive: new Date(),
      createdAt: new Date(),
    };

    if (!Array.isArray(currentAdmin.sessions)) {
      currentAdmin.sessions = [];
    }
    currentAdmin.sessions.unshift(newSession);
    if (currentAdmin.sessions.length > 15) {
      currentAdmin.sessions = currentAdmin.sessions.slice(0, 15);
    }

    // Record login activity
    if (!Array.isArray(currentAdmin.loginActivity)) {
      currentAdmin.loginActivity = [];
    }
    currentAdmin.loginActivity.unshift({
      ipAddress,
      userAgent,
      device,
      browser,
      os,
      status: "SUCCESS",
      failureReason: null,
      isSuspicious,
      suspiciousReason,
      timestamp: new Date(),
    });
    if (currentAdmin.loginActivity.length > 50) {
      currentAdmin.loginActivity = currentAdmin.loginActivity.slice(0, 50);
    }

    currentAdmin.markModified("sessions");
    currentAdmin.markModified("loginActivity");
    await currentAdmin.save();

    const passwordExpiry = getPasswordExpiryData(currentAdmin);

    const AdminToken = jwt.sign(
      {
        id: currentAdmin._id,
        role: "admin",
        sessionId,
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
      sessionId,
      user: {
        id: currentAdmin._id,
        email: currentAdmin.email,
        name: currentAdmin.name || "Alexandra Chronos",
        phone: currentAdmin.phone || "",
        bio: currentAdmin.bio || "",
        avatar: currentAdmin.avatar || "",
        role: "admin",
        roleTitle: currentAdmin.roleTitle || "Super Administrator",
      },
      passwordExpiry,
    });
  } catch (error) {
    console.error("ADMIN LOGIN ERROR:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select(
      "-password -otp -otpExpiresAt"
    );

    if (!admin) {
      return res
        .status(404)
        .json({ status: false, message: "Admin not found" });
    }

    const passwordExpiry = getPasswordExpiryData(admin);

    return res.status(200).json({
      status: true,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name || "Alexandra Chronos",
        phone: admin.phone || "",
        bio: admin.bio || "",
        avatar: admin.avatar || "",
        role: "admin",
        roleTitle: admin.roleTitle || "Super Administrator",
        createdAt: admin.createdAt,
      },
      passwordExpiry,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const updateAdminProfile = async (req, res) => {
  try {
    const { name, phone, bio, avatar, roleTitle } = req.body;

    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res
        .status(404)
        .json({ status: false, message: "Admin not found" });
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res
          .status(400)
          .json({ status: false, message: "Name cannot be empty" });
      }
      admin.name = name.trim();
    }

    if (phone !== undefined) {
      admin.phone = phone.trim();
    }

    if (bio !== undefined) {
      admin.bio = bio.trim();
    }

    if (avatar !== undefined) {
      admin.avatar = avatar;
    }

    if (roleTitle !== undefined && roleTitle.trim()) {
      admin.roleTitle = roleTitle.trim();
    }

    await admin.save();

    return res.status(200).json({
      status: true,
      message: "Admin profile updated successfully",
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        phone: admin.phone,
        bio: admin.bio,
        avatar: admin.avatar,
        role: "admin",
        roleTitle: admin.roleTitle,
      },
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const getAdminSessions = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select("sessions");
    if (!admin) {
      return res
        .status(404)
        .json({ status: false, message: "Admin not found" });
    }

    const currentSessionId = req.user.sessionId;

    const sessions = (admin.sessions || []).map((s) => ({
      sessionId: s.sessionId,
      device: s.device,
      browser: s.browser,
      os: s.os,
      deviceType: s.deviceType,
      ipAddress: s.ipAddress,
      lastActive: s.lastActive,
      createdAt: s.createdAt,
      isCurrent: s.sessionId === currentSessionId,
    }));

    // Sort: current session first, then newest lastActive
    sessions.sort((a, b) => {
      if (a.isCurrent) return -1;
      if (b.isCurrent) return 1;
      return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
    });

    return res.status(200).json({
      status: true,
      sessions,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const deleteAdminSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res
        .status(404)
        .json({ status: false, message: "Admin not found" });
    }

    admin.sessions = (admin.sessions || []).filter(
      (s) => s.sessionId !== sessionId
    );
    await admin.save();

    const currentSessionId = req.user.sessionId;
    const remainingSessions = admin.sessions.map((s) => ({
      sessionId: s.sessionId,
      device: s.device,
      browser: s.browser,
      os: s.os,
      deviceType: s.deviceType,
      ipAddress: s.ipAddress,
      lastActive: s.lastActive,
      createdAt: s.createdAt,
      isCurrent: s.sessionId === currentSessionId,
    }));

    return res.status(200).json({
      status: true,
      message: "Session terminated successfully",
      sessions: remainingSessions,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const logoutOtherAdminSessions = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res
        .status(404)
        .json({ status: false, message: "Admin not found" });
    }

    const currentSessionId = req.user.sessionId;
    admin.sessions = (admin.sessions || []).filter(
      (s) => s.sessionId === currentSessionId
    );
    await admin.save();

    const remainingSessions = admin.sessions.map((s) => ({
      sessionId: s.sessionId,
      device: s.device,
      browser: s.browser,
      os: s.os,
      deviceType: s.deviceType,
      ipAddress: s.ipAddress,
      lastActive: s.lastActive,
      createdAt: s.createdAt,
      isCurrent: true,
    }));

    return res.status(200).json({
      status: true,
      message: "All other sessions signed out successfully",
      sessions: remainingSessions,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const logoutAllAdminSessions = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res
        .status(404)
        .json({ status: false, message: "Admin not found" });
    }

    admin.sessions = [];
    await admin.save();

    return res.status(200).json({
      status: true,
      message: "All active sessions have been signed out",
      sessions: [],
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const getAdminLoginActivity = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select("loginActivity");
    if (!admin) {
      return res
        .status(404)
        .json({ status: false, message: "Admin not found" });
    }

    const activities = (admin.loginActivity || []).sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );

    const totalLogins = activities.length;
    const failedLogins = activities.filter((a) => a.status === "FAILED").length;
    const suspiciousCount = activities.filter((a) => a.isSuspicious).length;

    return res.status(200).json({
      status: true,
      activities,
      stats: {
        totalLogins,
        failedLogins,
        suspiciousCount,
      },
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const verifyAdminOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });

    if (!admin) {
      return res.status(401).json({ status: false, message: "Invalid Admin" });
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

    const resetToken = jwt.sign(
      { id: admin._id, purpose: "reset" },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    return res
      .status(200)
      .json({ status: true, message: "OTP Verified", resetToken });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const resetAdminPassword = async (req, res) => {
  try {
    const { resetToken, password, confirmPassword } = req.body;

    if (!resetToken || !password || !confirmPassword) {
      return res
        .status(400)
        .json({ status: false, message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ status: false, message: "Passwords do not match" });
    }

    // Policy requirement: at least 12 characters, uppercase, lowercase, number, special char
    if (!ADMIN_PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        status: false,
        message:
          "Administrator password must be at least 12 characters and include uppercase, lowercase, a number, and a special character.",
      });
    }

    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);

    if (decoded.purpose !== "reset") {
      return res.status(400).json({ status: false, message: "Invalid token" });
    }

    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res
        .status(404)
        .json({ status: false, message: "Admin not found" });
    }

    admin.password = await argon.hash(password);
    admin.passwordChangedAt = new Date();
    admin.failedLoginAttempts = 0;
    admin.lockUntil = null;

    await admin.save();

    return res.status(200).json({
      status: true,
      message:
        "Admin password updated successfully in accordance with security policy (valid for 90 days).",
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const sendAdminEmailChangeOTP = async (req, res) => {
  try {
    if (!process.env.BREVO_API_KEY || !process.env.BREVO_SENDER_EMAIL) {
      return res.status(500).json({
        status: false,
        message: "Email configuration is missing on server",
      });
    }

    const admin = await Admin.findById(req.user.id);

    if (!admin) {
      return res.status(404).json({
        status: false,
        message: "Admin not found",
      });
    }

    const adminOTP = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
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
            email: admin.email,
          },
        ],
        subject: "Chronos - Email Change Verification",
        htmlContent: `
            <h2>Admin Email Change Verification</h2>
            <h1>${adminOTP}</h1>
            <p>This OTP is valid for 5 minutes.</p>
            <p>
              If you did not request an email change,
              please ignore this email.
            </p>
          `,
      }),
    });

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

    admin.otp = adminOTP;
    admin.otpExpiresAt = otpExpiresAt;

    await admin.save();

    console.log("Admin email change OTP sent to:", admin.email);

    return res.status(200).json({
      status: true,
      message: "OTP sent successfully to your current email",
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

    if (!admin.otp) {
      return res.status(400).json({
        status: false,
        message: "OTP is invalid",
      });
    }

    if (!admin.otpExpiresAt || admin.otpExpiresAt < Date.now()) {
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

    admin.otp = null;
    admin.otpExpiresAt = null;

    await admin.save();

    return res
      .status(200)
      .json({ status: true, message: "OTP verified successfully" });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

export const changeAdminEmail = async (req, res) => {
  try {
    const { newEmail } = req.body;

    if (!newEmail) {
      return res.status(400).json({
        status: false,
        message: "New email is required",
      });
    }

    const cleanNewEmail = newEmail.toLowerCase().trim();

    const emailRegex =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|net|edu|gov|in|co|io|me)$/i;
    if (!emailRegex.test(cleanNewEmail)) {
      return res.status(400).json({
        status: false,
        message: "Please enter a valid email address",
      });
    }

    const admin = await Admin.findById(req.user.id);

    if (!admin) {
      return res.status(404).json({
        status: false,
        message: "Admin not found",
      });
    }

    if (cleanNewEmail === admin.email.toLowerCase()) {
      return res.status(400).json({
        status: false,
        message: "New email must be different from your current email",
      });
    }

    // Check another admin
    const existingAdmin = await Admin.findOne({
      email: cleanNewEmail,
      _id: { $ne: admin._id },
    });

    if (existingAdmin) {
      return res.status(400).json({
        status: false,
        message: "This email is already registered",
      });
    }

    // Check normal users
    const existingUser = await User.findOne({ email: cleanNewEmail });

    if (existingUser) {
      return res.status(400).json({
        status: false,
        message: "This email is already registered",
      });
    }

    admin.email = cleanNewEmail;
    await admin.save();

    return res.status(200).json({
      status: true,
      message: "Admin email changed successfully",
      email: admin.email,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong. Please try again.",
    });
  }
};