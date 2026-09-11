import User from "../models/UserModel.js"
import argon from "argon2"


const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const userProfile = async ( req, res ) =>{
    try {
    const userId = req.user.id;
    const existUser = await User.findById(userId).select('-password'); 
    if(!existUser) return res.status(401).json({ status:false, message:"Invalid user"})
        return res.status(200).json({ status:true, message:"User Fetched Sucessfully", userDetails:existUser})
    } catch (error) {
    return res.status(500).json({ status:false, message:error.message})       
    }
}

export const updateUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "Invalid User",
      });
    }

    const allowedFields = ["firstName", "lastName", "password"];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field]) {
        updates[field] = req.body[field];
      }
    });

    // Password requires OTP verification
    if (updates.password) {
      if (!user.passwordChangeVerified) {
        return res.status(403).json({
          status: false,
          message: "Please verify OTP before changing your password",
        });
      }

      updates.password = await argon.hash(updates.password);

      // OTP verification is consumed after password change
      user.passwordChangeVerified = false;
      user.passwordChangeOtp = null;
      user.passwordChangeOtpExpiresAt = null;
    }

    Object.assign(user, updates);

    await user.save();

    const { password, ...userData } = user.toObject();

    return res.status(200).json({
      status: true,
      message: "Updated User Datas",
      user: userData,
    });
  } catch (error) {
    console.error("updateUser Error:", error);

    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
}

export const addAddress = async (req, res) => {
  try {
    const userId = req.user.id;

    const {firstName,lastName,phone,address,city,state,pincode,isDefault} = req.body;

    if ( !firstName || !lastName || !phone || !address || !city || !state || !pincode) {
    return res.status(400).json({status: false, message: "All address fields are required"});
    }

    const user = await User.findById(userId);

    if (!user) {
    return res.status(404).json({status: false,message: "User not found"});
    }

    const makeDefault =user.addresses.length === 0 || isDefault === true;
    if (makeDefault) {
    user.addresses.forEach((item) => { item.isDefault = false});
    }

    user.addresses.push({
      firstName,
      lastName,
      phone,
      address,
      city,
      state,
      pincode,
      isDefault: makeDefault
    });

    await user.save();

    return res.status(201).json({ status: true,message: "Address added successfully", addresses: user.addresses});

  } catch (error) {
    return res.status(500).json({status: false,message: error.message});
  }
}


export const getAddresses = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("addresses");

    if (!user) {
    return res.status(404).json({status: false,message: "User not found"});
    }

    return res.status(200).json({status: true,message: "Addresses fetched successfully",addresses: user.addresses});

  } catch (error) {
    return res.status(500).json({status: false,message: error.message});
  }
}


export const updateAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;

    const {firstName,lastName,phone,address,city,state,pincode,isDefault} = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({status: false, message: "User not found"});
    }

    const existingAddress = user.addresses.id(addressId);
    if (!existingAddress) {
      return res.status(404).json({ status: false, message: "Address not found"});
    }

    if (isDefault === true) {
      user.addresses.forEach((item) => {
        item.isDefault = false;
      });
    }

    existingAddress.firstName = firstName;
    existingAddress.lastName = lastName;
    existingAddress.phone = phone;
    existingAddress.address = address;
    existingAddress.city = city;
    existingAddress.state = state;
    existingAddress.pincode = pincode;

    if (isDefault !== undefined) {
      existingAddress.isDefault = isDefault;
    }

    await user.save();
    return res.status(200).json({status: true,message: "Address updated successfully",addresses: user.addresses});

  } catch (error) {
    return res.status(500).json({status: false, message: error.message });
  }
}



export const deleteAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
    return res.status(404).json({ status: false, message: "User not found"});
    }

    const existingAddress = user.addresses.id(addressId);
    if (!existingAddress) {
    return res.status(404).json({status: false,message: "Address not found"});
    }

    const wasDefault = existingAddress.isDefault;

    user.addresses.pull(addressId);
    if (wasDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
    }

    await user.save();
    return res.status(200).json({ status: true,message: "Address deleted successfully",addresses: user.addresses});

  } catch (error) {
    return res.status(500).json({status: false, message: error.message});
  }
}


export const setDefaultAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
    return res.status(404).json({status: false, message: "User not found"});
    }

    const selectedAddress = user.addresses.id(addressId);
    if (!selectedAddress) {
    return res.status(404).json({status: false,message: "Address not found"});
    }

    user.addresses.forEach((item) => {
    item.isDefault = item._id.equals(addressId)
    });

    await user.save();
    return res.status(200).json({status: true,message: "Default address updated successfully",  addresses: user.addresses});
  } catch (error) {
    return res.status(500).json({status: false,message: error.message});
  }
}


export const sendEmailChangeOTP = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    if (
      !process.env.BREVO_API_KEY ||
      !process.env.BREVO_SENDER_EMAIL
    ) {
      return res.status(500).json({
        status: false,
        message: "Email configuration is missing on server",
      });
    }

    const otp = generateOTP();

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
              email: user.email,
            },
          ],
          subject: "Chronos - Email Change Verification",
          htmlContent: `
            <h2>Email Change Verification</h2>

            <p>Hello ${user.firstName},</p>

            <p>
              Use the OTP below to verify your current email address
              before changing your Chronos account email.
            </p>

            <h1>${otp}</h1>

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
    console.log("BREVO STATUS:", response.status, data);

    if (!response.ok) {
      console.error("BREVO ERROR:", data);

      return res.status(502).json({
        status: false,
        message: "Failed to send OTP email",
      });
    }

    user.emailChangeOtp = otp;
    user.emailChangeOtpExpiresAt = otpExpiresAt;
    user.emailChangeVerified = false;

    await user.save();

    return res.status(200).json({
      status: true,
      message: "OTP sent successfully to your current email",
    });
  } catch (error) {
    console.error("sendEmailChangeOTP Error:", error);

    return res.status(500).json({
      status: false,
      message: "Something went wrong. Please try again.",
    });
  }
};



export const verifyEmailChangeOTP = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({
        status: false,
        message: "OTP is required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    if (!user.emailChangeOtp) {
      return res.status(400).json({
        status: false,
        message: "OTP is invalid",
      });
    }

    if (
      !user.emailChangeOtpExpiresAt ||
      user.emailChangeOtpExpiresAt < Date.now()
    ) {
      return res.status(400).json({
        status: false,
        message: "OTP is expired",
      });
    }

    if (user.emailChangeOtp !== otp.toString()) {
      return res.status(400).json({
        status: false,
        message: "OTP is invalid",
      });
    }

    user.emailChangeOtp = null;
    user.emailChangeOtpExpiresAt = null;
    user.emailChangeVerified = true;

    await user.save();

    return res.status(200).json({
      status: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("verifyEmailChangeOTP Error:", error);

    return res.status(500).json({
      status: false,
      message: "Something went wrong. Please try again.",
    });
  }
}


export const changeUserEmail = async (req, res) => {
  try {
    const userId = req.user.id;
    const { newEmail } = req.body;

    if (!newEmail) {
      return res.status(400).json({
        status: false,
        message: "New email is required",
      });
    }

    const cleanNewEmail = newEmail.trim().toLowerCase();

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|net|edu|gov|in|co|io|me)$/i;

    if (!emailRegex.test(cleanNewEmail)) {
      return res.status(400).json({
        status: false,
        message: "Please enter a valid email address",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    // OTP verification is mandatory
    if (!user.emailChangeVerified) {
      return res.status(403).json({
        status: false,
        message: "Please verify the OTP before changing your email",
      });
    }

    if (cleanNewEmail === user.email.toLowerCase()) {
      return res.status(400).json({
        status: false,
        message:
          "New email must be different from your current email",
      });
    }

    const existingUser = await User.findOne({
      email: cleanNewEmail,
      _id: { $ne: user._id },
    });

    if (existingUser) {
      return res.status(409).json({
        status: false,
        message: "An account with this email already exists",
      });
    }

    user.email = cleanNewEmail;

    // Consume the verification
    user.emailChangeVerified = false;
    user.emailChangeOtp = null;
    user.emailChangeOtpExpiresAt = null;

    await user.save();

    const { password, ...userData } = user.toObject();

    return res.status(200).json({
      status: true,
      message: "Email changed successfully",
      user: userData,
    });
  } catch (error) {
    console.error("changeUserEmail Error:", error);

    return res.status(500).json({
      status: false,
      message: "Something went wrong. Please try again.",
    });
  }
}

export const sendPasswordChangeOTP = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    if (
      !process.env.BREVO_API_KEY ||
      !process.env.BREVO_SENDER_EMAIL
    ) {
      return res.status(500).json({
        status: false,
        message: "Email configuration is missing on server",
      });
    }

    const otp = generateOTP();

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
              email: user.email,
            },
          ],
          subject: "Chronos - Password Change Verification",
          htmlContent: `
            <h2>Password Change Verification</h2>
            <p>Hello ${user.firstName},</p>

            <p>
              Use the OTP below to verify your identity
              before changing your Chronos account password.
            </p>

            <h1>${otp}</h1>

            <p>This OTP is valid for 5 minutes.</p>

            <p>
              If you did not request a password change,
              please ignore this email.
            </p>
          `,
        }),
      }
    );

    const data = await response.json();

    console.log("PASSWORD OTP BREVO STATUS:", response.status, data);

    if (!response.ok) {
      console.error("PASSWORD OTP BREVO ERROR:", data);

      return res.status(502).json({
        status: false,
        message: "Failed to send OTP email",
      });
    }

    user.passwordChangeOtp = otp;
    user.passwordChangeOtpExpiresAt = otpExpiresAt;
    user.passwordChangeVerified = false;

    await user.save();

    return res.status(200).json({
      status: true,
      message: "OTP sent successfully to your current email",
    });
  } catch (error) {
    console.error("sendPasswordChangeOTP Error:", error);

    return res.status(500).json({
      status: false,
      message: "Something went wrong. Please try again.",
    });
  }
}

export const verifyPasswordChangeOTP = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({
        status: false,
        message: "OTP is required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    if (!user.passwordChangeOtp) {
      return res.status(400).json({
        status: false,
        message: "OTP is invalid",
      });
    }

    if (
      !user.passwordChangeOtpExpiresAt ||
      user.passwordChangeOtpExpiresAt < Date.now()
    ) {
      return res.status(400).json({
        status: false,
        message: "OTP is expired",
      });
    }

    if (user.passwordChangeOtp !== otp.toString()) {
      return res.status(400).json({
        status: false,
        message: "OTP is invalid",
      });
    }

    user.passwordChangeOtp = null;
    user.passwordChangeOtpExpiresAt = null;
    user.passwordChangeVerified = true;

    await user.save();

    return res.status(200).json({
      status: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("verifyPasswordChangeOTP Error:", error);

    return res.status(500).json({
      status: false,
      message: "Something went wrong. Please try again.",
    });
  }
}