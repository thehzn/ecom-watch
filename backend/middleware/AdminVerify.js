import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Admin from "../models/AdminModel.js";

dotenv.config();

// 30 minutes inactivity timeout
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;

export const verifyAdmin = async (req, res, next) => {
  try {
    const adminToken = req.headers.authorization;
    if (!adminToken) {
      return res.status(401).json({ status: false, message: "Token not Found" });
    }
    const token = adminToken.split(" ")[1];
    if (!token) {
      return res.status(401).json({ status: false, message: "Invalid authorization header format" });
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    if (decodedData.role !== "admin") {
      return res.status(401).json({ status: false, message: "Access Denied" });
    }

    // Verify session in database if sessionId is present
    if (decodedData.sessionId) {
      const admin = await Admin.findById(decodedData.id).select("sessions email name roleTitle passwordChangedAt");
      if (!admin) {
        return res.status(401).json({ status: false, message: "Admin account not found" });
      }

      const currentSession = (admin.sessions || []).find(
        (s) => s.sessionId === decodedData.sessionId
      );

      if (!currentSession) {
        return res.status(401).json({
          status: false,
          sessionExpired: true,
          message: "Session has been terminated or expired. Please sign in again.",
        });
      }

      // Inactivity timeout check (30 minutes)
      const lastActiveTime = currentSession.lastActive
        ? new Date(currentSession.lastActive).getTime()
        : currentSession.createdAt
        ? new Date(currentSession.createdAt).getTime()
        : Date.now();

      if (Date.now() - lastActiveTime > INACTIVITY_TIMEOUT_MS) {
        // Expire session from database
        await Admin.updateOne(
          { _id: admin._id },
          { $pull: { sessions: { sessionId: decodedData.sessionId } } }
        ).catch(() => {});

        return res.status(401).json({
          status: false,
          sessionTimeout: true,
          message: "Admin session timed out due to 30 minutes of inactivity. Please sign in again.",
        });
      }

      // Update last active time if more than 1 minute since previous update
      if (Date.now() - lastActiveTime > 60 * 1000) {
        Admin.updateOne(
          { _id: admin._id, "sessions.sessionId": decodedData.sessionId },
          { $set: { "sessions.$.lastActive": new Date() } }
        ).catch(() => {});
      }

      req.admin = admin;
    }

    req.user = decodedData;
    next();
  } catch (error) {
    return res.status(401).json({ status: false, message: error.message });
  }
};
