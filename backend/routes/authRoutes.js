import express from "express"
import { login, register, resetPassword, verifyOtp } from "../controllers/authControllers.js"
import { sendOTP } from "../utils/sendEmail.js"
import passport from "../config/passport.js"
import jwt from "jsonwebtoken"



import crypto from "crypto";
import { parseUserAgent, getClientIp } from "../utils/deviceParser.js";

const router = express.Router()

router.post("/user/register",register)
router.post("/user/login",login)

router.post("/user/sendotp",sendOTP)
router.post("/user/verifyotp",verifyOtp)
router.post("/user/resetpassword",resetPassword)

router.get("/google",passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "https://ecom-watch-peach.vercel.app/login",
  }),
  async (req, res) => {
    try {
      const sessionId = crypto.randomUUID();
      const userAgent = req.headers["user-agent"] || "";
      const { device, browser, os, deviceType } = parseUserAgent(userAgent);
      const ipAddress = getClientIp(req);

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

      if (!Array.isArray(req.user.sessions)) {
        req.user.sessions = [];
      }

      // Remove any previous active session from the same physical device/browser to prevent duplication
      req.user.sessions = req.user.sessions.filter(
        (s) =>
          !(
            s.browser === browser &&
            s.os === os &&
            (s.deviceType || 'Desktop') === (deviceType || 'Desktop')
          )
      );

      req.user.sessions.unshift(newSession);
      if (req.user.sessions.length > 10) {
        req.user.sessions = req.user.sessions.slice(0, 10);
      }

      if (!Array.isArray(req.user.loginActivities)) {
        req.user.loginActivities = [];
      }
      req.user.loginActivities.unshift({
        ipAddress,
        userAgent,
        device,
        browser,
        os,
        deviceType,
        status: "Success",
        reason: "Google Authentication",
        isSuspicious: false,
        timestamp: new Date(),
      });
      if (req.user.loginActivities.length > 20) {
        req.user.loginActivities = req.user.loginActivities.slice(0, 20);
      }

      await req.user.save();

      const userToken = jwt.sign(
        {
          id: req.user._id,
          role: req.user.role,
          sessionId,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

      const userData = encodeURIComponent(
        JSON.stringify({
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          email: req.user.email,
          countryCode: req.user.countryCode,
          mobileNumber: req.user.mobileNumber,
          role: req.user.role,
        })
      );

      return res.redirect(
        `https://ecom-watch-peach.vercel.app/login?token=${userToken}&user=${userData}`
      );
    } catch (err) {
      console.error("Google Callback Error:", err);
      return res.redirect("https://ecom-watch-peach.vercel.app/login?error=auth_failed");
    }
  }
);
export default router








