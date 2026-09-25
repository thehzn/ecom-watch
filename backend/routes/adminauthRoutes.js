import express from "express";
import crypto from "crypto";
import {
  Adminlogin,
  changeAdminEmail,
  resetAdminPassword,
  sendAdminEmailChangeOTP,
  verifyAdminEmailChangeOTP,
  verifyAdminOtp,
  getAdminProfile,
  updateAdminProfile,
  getAdminSessions,
  deleteAdminSession,
  logoutOtherAdminSessions,
  logoutAllAdminSessions,
  getAdminLoginActivity,
} from "../controllers/adminauthControllers.js";
import { sendAdminOTP } from "../utils/sendAdminEmail.js";
import { verifyAdmin } from "../middleware/AdminVerify.js";
import passport from "../config/passport.js";
import jwt from "jsonwebtoken";
import Admin from "../models/AdminModel.js";
import { parseUserAgent, getClientIp } from "../utils/deviceParser.js";

const router = express.Router();

// Public auth routes
router.post("/admin/login", Adminlogin);
router.post("/admin/sendotp", sendAdminOTP);
router.post("/admin/verifyotp", verifyAdminOtp);
router.post("/admin/resetadminpassword", resetAdminPassword);

// Protected email management routes
router.post("/admin/change-email", verifyAdmin, sendAdminEmailChangeOTP);
router.post("/admin/verify-email", verifyAdmin, verifyAdminEmailChangeOTP);
router.post("/admin/update-email", verifyAdmin, changeAdminEmail);

// Protected admin profile routes
router.get("/admin/profile", verifyAdmin, getAdminProfile);
router.put("/admin/profile", verifyAdmin, updateAdminProfile);

// Protected admin sessions & devices routes
router.get("/admin/sessions", verifyAdmin, getAdminSessions);
router.delete("/admin/sessions/others", verifyAdmin, logoutOtherAdminSessions);
router.delete("/admin/sessions/all", verifyAdmin, logoutAllAdminSessions);
router.delete("/admin/sessions/:sessionId", verifyAdmin, deleteAdminSession);

// Protected admin login activity audit routes
router.get("/admin/login-activity", verifyAdmin, getAdminLoginActivity);

// Google OAuth for Admin
router.get(
  "/google/admin",
  passport.authenticate("google-admin", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/admin/callback",
  passport.authenticate("google-admin", {
    session: false,
   failureRedirect: "https://ecom-watch-peach.vercel.app/admin/login",
  }),
  async (req, res) => {
    try {
      const admin = await Admin.findById(req.user._id);
      const sessionId = crypto.randomUUID();
      const userAgent = req.headers["user-agent"] || "";
      const { device, browser, os, deviceType } = parseUserAgent(userAgent);
      const ipAddress = getClientIp(req);

      if (admin) {
        if (!Array.isArray(admin.sessions)) admin.sessions = [];
        admin.sessions.unshift({
          sessionId,
          device,
          browser,
          os,
          deviceType,
          ipAddress,
          lastActive: new Date(),
          createdAt: new Date(),
        });
        if (admin.sessions.length > 15) admin.sessions = admin.sessions.slice(0, 15);

        if (!Array.isArray(admin.loginActivity)) admin.loginActivity = [];
        admin.loginActivity.unshift({
          ipAddress,
          userAgent,
          device,
          browser,
          os,
          status: "SUCCESS",
          isSuspicious: false,
          suspiciousReason: "Google SSO Authentication",
          timestamp: new Date(),
        });
        if (admin.loginActivity.length > 50) admin.loginActivity = admin.loginActivity.slice(0, 50);

        await admin.save();
      }

      const adminToken = jwt.sign(
        {
          id: req.user._id,
          role: "admin",
          sessionId,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1d",
        }
      );

      const adminData = encodeURIComponent(
        JSON.stringify({
          id: req.user._id,
          email: req.user.email,
          name: admin?.name || "Alexandra Chronos",
          role: "admin",
          roleTitle: admin?.roleTitle || "Super Administrator",
        })
      );

    return res.redirect(
  `https://ecom-watch-peach.vercel.app/admin/login?token=${adminToken}&user=${adminData}`
);
    } catch (err) {
      console.error("Google Admin callback error:", err);
      return res.redirect("/admin/login?error=oauth_failed");
    }
  }
);

export default router;