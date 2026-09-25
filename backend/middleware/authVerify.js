import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/UserModel.js";

dotenv.config();

// 30 minutes inactivity timeout for user sessions
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;

export const verifyUser = async (req, res, next) => {
  try {
    const userToken = req.headers.authorization;
    if (!userToken) {
      return res.status(401).json({ status: false, message: "Token not Found" });
    }
    const token = userToken.split(" ")[1];
    if (!token) {
      return res.status(401).json({ status: false, message: "Invalid authorization header format" });
    }
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    if (decodedData.role === "admin") {
      return res.status(403).json({
        status: false,
        message: "Access Denied: Customer endpoints cannot be accessed by admin accounts.",
      });
    }

    // If token has a sessionId, verify session is still active in database
    if (decodedData.sessionId) {
      const user = await User.findById(decodedData.id).select("sessions role");

      if (!user) {
        return res.status(401).json({
          status: false,
          message: "User not found. Please sign in again.",
        });
      }

      // If the user document has sessions tracked and this sessionId was removed, deny
      if (Array.isArray(user.sessions) && user.sessions.length > 0) {
        const currentSession = user.sessions.find(
          (s) => s.sessionId === decodedData.sessionId
        );

        if (!currentSession) {
          return res.status(401).json({
            status: false,
            sessionExpired: true,
            message: "Session has been terminated or logged out. Please sign in again.",
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
          await User.updateOne(
            { _id: user._id },
            { $pull: { sessions: { sessionId: decodedData.sessionId } } }
          ).catch(() => {});

          return res.status(401).json({
            status: false,
            sessionTimeout: true,
            message: "Session timed out due to 30 minutes of inactivity. Please sign in again.",
          });
        }

        // Update last active timestamp if more than 1 minute has passed
        if (Date.now() - lastActiveTime > 60 * 1000) {
          User.updateOne(
            { _id: user._id, "sessions.sessionId": decodedData.sessionId },
            { $set: { "sessions.$.lastActive": new Date() } }
          ).catch(() => {});
        }
      }
    }

    req.user = decodedData;
    next();
  } catch (error) {
    return res.status(401).json({ status: false, message: error.message });
  }
};


