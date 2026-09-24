import mongoose from "mongoose";

const adminSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  device: { type: String, default: "Desktop Device" },
  browser: { type: String, default: "Web Browser" },
  os: { type: String, default: "Desktop OS" },
  deviceType: { type: String, default: "Desktop" },
  ipAddress: { type: String, default: "127.0.0.1" },
  lastActive: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

const adminLoginActivitySchema = new mongoose.Schema({
  ipAddress: { type: String, default: "127.0.0.1" },
  userAgent: { type: String, default: "" },
  device: { type: String, default: "Desktop Device" },
  browser: { type: String, default: "Web Browser" },
  os: { type: String, default: "Desktop OS" },
  status: { type: String, enum: ["SUCCESS", "FAILED"], default: "SUCCESS" },
  failureReason: { type: String, default: null },
  isSuspicious: { type: Boolean, default: false },
  suspiciousReason: { type: String, default: null },
  timestamp: { type: Date, default: Date.now },
});

const adminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, default: "Alexandra Chronos" },
    phone: { type: String, default: "" },
    bio: {
      type: String,
      default:
        "Overseeing catalogue curation and order operations for the Chronos horology collection.",
    },
    avatar: { type: String, default: "" },
    roleTitle: { type: String, default: "Super Administrator" },
    sessions: [adminSessionSchema],
    loginActivity: [adminLoginActivitySchema],
    passwordChangedAt: { type: Date, default: Date.now },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    otp: { type: String },
    otpExpiresAt: { type: Date },
    googleId: { type: String, unique: true, sparse: true },
    pendingEmail: { type: String },
  },
  { timestamps: true }
);

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;