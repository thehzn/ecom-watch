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

    const passwordRegex =  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

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
}



export const sendAdminEmailChangeOTP = async (req, res) => {
  try {
    if (
      !process.env.BREVO_API_KEY ||
      !process.env.BREVO_SENDER_EMAIL
    ) {
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

    const otpExpiresAt = new Date(
      Date.now() + 5 * 60 * 1000
    );

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

    admin.otp = adminOTP;
    admin.otpExpiresAt = otpExpiresAt;

    await admin.save();

    console.log(
      "Admin email change OTP sent to:",
      admin.email
    );

    return res.status(200).json({
      status: true,
      message: "OTP sent successfully to your current email",
    });

  } catch (error) {
    console.error(
      "sendAdminEmailChangeOTP Error:",
      error
    );

    return res.status(500).json({
      status: false,
      message: "Something went wrong. Please try again.",
    });
  }
}


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

    if (
      !admin.otpExpiresAt ||
      admin.otpExpiresAt < Date.now()
    ) {
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

    // OTP verified successfully.
    // Do NOT change the email here.
    admin.otp = null;
    admin.otpExpiresAt = null;

    await admin.save();

    return res.status(200).json({status: true,message: "OTP verified successfully"});

  } catch (error) {
    return res.status(500).json({status: false,message: "Something went wrong. Please try again.",});
  }
}



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

    // Basic email validation
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
      return res.status(400).json({status: false,message:"New email must be different from your current email"});
    }

    // Check another admin
    const existingAdmin = await Admin.findOne({email: cleanNewEmail,_id: { $ne: admin._id } });

    if (existingAdmin) {
      return res.status(400).json({
        status: false,
        message: "This email is already registered",
      });
    }

    // Check normal users
    const existingUser = await User.findOne({email: cleanNewEmail});

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
    return res.status(500).json({status: false, message: "Something went wrong. Please try again.",});
  }
}