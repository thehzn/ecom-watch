import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      minlength: [2, "First name must be at least 2 characters"],
      maxlength: [50, "First name must be at most 50 characters"],
      trim: true,
      required: [true, "First name is required"],
    },

    lastName: {
      type: String,
      minlength: [1, "Last name must be at least 1 character"],
      maxlength: [50, "Last name must be at most 50 characters"],
      trim: true,
      required: [true, "Last name is required"],
    },

    email: {
      type: String,
      trim: true,
      required: [true, "Email is required"],
      match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Please enter a valid email"],
      lowercase: true,
      unique: true,
    },

    countryCode: {
      type: String,
      trim: true,
      default: "+91",
    },

    mobileNumber: {
      type: String,
      trim: true,
      default: "",
    },

    dob: {
      type: Date,
      default: null,
      validate: {
        validator: function (value) {
          if (!value) return true;
          const now = new Date();
          const minDate = new Date();
          minDate.setFullYear(minDate.getFullYear() - 120);
          return value <= now && value >= minDate;
        },
        message: "Please enter a valid date of birth",
      },
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other", "Prefer not to say", ""],
      default: "",
    },

    password: { type: String, required: [true, "Password is required"] },

    role: { type: String, enum: ["user", "admin"], default: "user" },

    otp: { type: String },

    otpExpiresAt: { type: Date },

    emailChangeOtp: { type: String },
    
    emailChangeOtpExpiresAt: { type: Date },
    
    emailChangeVerified: { type: Boolean, default: false },

    passwordChangeOtp: {type: String},

    passwordChangeOtpExpiresAt: {type: Date},
    
    passwordChangeVerified: {type: Boolean,default: false},

    addresses: [
      {
        firstName: { type: String, trim: true },
        lastName: { type: String, trim: true },
        phone: { type: String, trim: true },
        address: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        pincode: { type: String, trim: true },
        isDefault: { type: Boolean, default: false },
      },
    ],

    sessions: [
      {
        sessionId: { type: String, required: true },
        device: { type: String, default: "Unknown Device" },
        browser: { type: String, default: "Unknown Browser" },
        os: { type: String, default: "Unknown OS" },
        deviceType: { type: String, enum: ["Desktop", "Mobile", "Tablet"], default: "Desktop" },
        ipAddress: { type: String, default: "" },
        lastActive: { type: Date, default: Date.now },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("user", userSchema);
export default User;
