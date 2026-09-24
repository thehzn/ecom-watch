import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/UserModel.js";

dotenv.config();

export const verifyUser = async (req, res, next) => {
  try {
    const userToken = req.headers.authorization;
    if (!userToken) {
      return res.status(401).json({ status: false, message: "Token not Found" });
    }
    const token = userToken.split(" ")[1];
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    if (decodedData.role === "admin") {
      return res.status(403).json({
        status: false,
        message: "Access Denied: Customer endpoints cannot be accessed by admin accounts.",
      });
    }

    // If token has a sessionId, verify session is still active in database
    if (decodedData.sessionId) {
      const user = await User.findOne({
        _id: decodedData.id,
        "sessions.sessionId": decodedData.sessionId,
      }).select("sessions role");

      if (!user) {
        return res.status(401).json({
          status: false,
          message: "Session has been terminated or logged out. Please sign in again.",
        });
      }

      // Update last active timestamp
      const currentSession = user.sessions.find(
        (s) => s.sessionId === decodedData.sessionId
      );
      if (
        currentSession &&
        (!currentSession.lastActive ||
          Date.now() - new Date(currentSession.lastActive).getTime() > 5 * 60 * 1000)
      ) {
        User.updateOne(
          { _id: user._id, "sessions.sessionId": decodedData.sessionId },
          { $set: { "sessions.$.lastActive": new Date() } }
        ).catch(() => {});
      }
    }

    req.user = decodedData;
    next();
  } catch (error) {
    return res.status(401).json({ status: false, message: error.message });
  }
};


