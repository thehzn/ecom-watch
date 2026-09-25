// import User from "../models/UserModel.js"
// import argon from "argon2"


// const generateOTP = () =>
//   Math.floor(100000 + Math.random() * 900000).toString();

// export const userProfile = async ( req, res ) =>{
//     try {
//     const userId = req.user.id;
//     const existUser = await User.findById(userId).select('-password'); 
//     if(!existUser) return res.status(401).json({ status:false, message:"Invalid user"})
//         return res.status(200).json({ status:true, message:"User Fetched Sucessfully", userDetails:existUser})
//     } catch (error) {
//     return res.status(500).json({ status:false, message:error.message})       
//     }
// }

// export const updateUser = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({
//         status: false,
//         message: "Invalid User",
//       });
//     }

//     const allowedFields = ["firstName", "lastName", "password", "dob", "gender", "countryCode", "mobileNumber"];
//     const updates = {};

//     for (const field of allowedFields) {
//       if (req.body[field] !== undefined) {
//         if (field === "dob") {
//           if (req.body.dob) {
//             const parsedDate = new Date(req.body.dob);
//             if (isNaN(parsedDate.getTime())) {
//               return res.status(400).json({ status: false, message: "Invalid date of birth" });
//             }
//             const now = new Date();
//             if (parsedDate > now) {
//               return res.status(400).json({ status: false, message: "Date of birth cannot be in the future" });
//             }
//             const thirteenYearsAgo = new Date();
//             thirteenYearsAgo.setFullYear(thirteenYearsAgo.getFullYear() - 13);
//             if (parsedDate > thirteenYearsAgo) {
//               return res.status(400).json({ status: false, message: "You must be at least 13 years old" });
//             }
//             const minDate = new Date();
//             minDate.setFullYear(minDate.getFullYear() - 120);
//             if (parsedDate < minDate) {
//               return res.status(400).json({ status: false, message: "Please enter a valid date of birth" });
//             }
//             updates.dob = parsedDate;
//           } else {
//             updates.dob = null;
//           }
//         } else if (field === "gender") {
//           const validGenders = ["Male", "Female", "Other", "Prefer not to say", ""];
//           if (!validGenders.includes(req.body.gender)) {
//             return res.status(400).json({ status: false, message: "Invalid gender selection" });
//           }
//           updates.gender = req.body.gender;
//         } else {
//           updates[field] = req.body[field];
//         }
//       }
//     }

//     // Password requires OTP verification
//     if (updates.password) {
//       if (!user.passwordChangeVerified) {
//         return res.status(403).json({
//           status: false,
//           message: "Please verify OTP before changing your password",
//         });
//       }

//       updates.password = await argon.hash(updates.password);

//       // OTP verification is consumed after password change
//       user.passwordChangeVerified = false;
//       user.passwordChangeOtp = null;
//       user.passwordChangeOtpExpiresAt = null;
//     }

//     Object.assign(user, updates);

//     await user.save();

//     const { password, ...userData } = user.toObject();

//     return res.status(200).json({
//       status: true,
//       message: "Updated User Datas",
//       user: userData,
//     });
//   } catch (error) {
//     console.error("updateUser Error:", error);

//     return res.status(500).json({
//       status: false,
//       message: error.message,
//     });
//   }
// }

// export const addAddress = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const {firstName,lastName,phone,address,city,state,pincode,isDefault} = req.body;

//     if ( !firstName || !lastName || !phone || !address || !city || !state || !pincode) {
//     return res.status(400).json({status: false, message: "All address fields are required"});
//     }

//     const user = await User.findById(userId);

//     if (!user) {
//     return res.status(404).json({status: false,message: "User not found"});
//     }

//     const makeDefault =user.addresses.length === 0 || isDefault === true;
//     if (makeDefault) {
//     user.addresses.forEach((item) => { item.isDefault = false});
//     }

//     user.addresses.push({
//       firstName,
//       lastName,
//       phone,
//       address,
//       city,
//       state,
//       pincode,
//       isDefault: makeDefault
//     });

//     await user.save();

//     return res.status(201).json({ status: true,message: "Address added successfully", addresses: user.addresses});

//   } catch (error) {
//     return res.status(500).json({status: false,message: error.message});
//   }
// }


// export const getAddresses = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const user = await User.findById(userId).select("addresses");

//     if (!user) {
//     return res.status(404).json({status: false,message: "User not found"});
//     }

//     return res.status(200).json({status: true,message: "Addresses fetched successfully",addresses: user.addresses});

//   } catch (error) {
//     return res.status(500).json({status: false,message: error.message});
//   }
// }


// export const updateAddress = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { addressId } = req.params;

//     const {firstName,lastName,phone,address,city,state,pincode,isDefault} = req.body;

//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({status: false, message: "User not found"});
//     }

//     const existingAddress = user.addresses.id(addressId);
//     if (!existingAddress) {
//       return res.status(404).json({ status: false, message: "Address not found"});
//     }

//     if (isDefault === true) {
//       user.addresses.forEach((item) => {
//         item.isDefault = false;
//       });
//     }

//     existingAddress.firstName = firstName;
//     existingAddress.lastName = lastName;
//     existingAddress.phone = phone;
//     existingAddress.address = address;
//     existingAddress.city = city;
//     existingAddress.state = state;
//     existingAddress.pincode = pincode;

//     if (isDefault !== undefined) {
//       existingAddress.isDefault = isDefault;
//     }

//     await user.save();
//     return res.status(200).json({status: true,message: "Address updated successfully",addresses: user.addresses});

//   } catch (error) {
//     return res.status(500).json({status: false, message: error.message });
//   }
// }



// export const deleteAddress = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { addressId } = req.params;

//     const user = await User.findById(userId);

//     if (!user) {
//     return res.status(404).json({ status: false, message: "User not found"});
//     }

//     const existingAddress = user.addresses.id(addressId);
//     if (!existingAddress) {
//     return res.status(404).json({status: false,message: "Address not found"});
//     }

//     const wasDefault = existingAddress.isDefault;

//     user.addresses.pull(addressId);
//     if (wasDefault && user.addresses.length > 0) {
//     user.addresses[0].isDefault = true;
//     }

//     await user.save();
//     return res.status(200).json({ status: true,message: "Address deleted successfully",addresses: user.addresses});

//   } catch (error) {
//     return res.status(500).json({status: false, message: error.message});
//   }
// }


// export const setDefaultAddress = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { addressId } = req.params;

//     const user = await User.findById(userId);

//     if (!user) {
//     return res.status(404).json({status: false, message: "User not found"});
//     }

//     const selectedAddress = user.addresses.id(addressId);
//     if (!selectedAddress) {
//     return res.status(404).json({status: false,message: "Address not found"});
//     }

//     user.addresses.forEach((item) => {
//     item.isDefault = item._id.equals(addressId)
//     });

//     await user.save();
//     return res.status(200).json({status: true,message: "Default address updated successfully",  addresses: user.addresses});
//   } catch (error) {
//     return res.status(500).json({status: false,message: error.message});
//   }
// }


// export const sendEmailChangeOTP = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({
//         status: false,
//         message: "User not found",
//       });
//     }

//     if (
//       !process.env.BREVO_API_KEY ||
//       !process.env.BREVO_SENDER_EMAIL
//     ) {
//       return res.status(500).json({
//         status: false,
//         message: "Email configuration is missing on server",
//       });
//     }

//     const otp = generateOTP();

//     const otpExpiresAt = new Date(
//       Date.now() + 5 * 60 * 1000
//     );

//     const response = await fetch(
//       "https://api.brevo.com/v3/smtp/email",
//       {
//         method: "POST",
//         headers: {
//           accept: "application/json",
//           "api-key": process.env.BREVO_API_KEY,
//           "content-type": "application/json",
//         },
//         body: JSON.stringify({
//           sender: {
//             name: "Chronos Haute Horlogerie",
//             email: process.env.BREVO_SENDER_EMAIL,
//           },
//           to: [
//             {
//               email: user.email,
//             },
//           ],
//           subject: "Chronos - Email Change Verification",
//           htmlContent: `
//             <h2>Email Change Verification</h2>

//             <p>Hello ${user.firstName},</p>

//             <p>
//               Use the OTP below to verify your current email address
//               before changing your Chronos account email.
//             </p>

//             <h1>${otp}</h1>

//             <p>This OTP is valid for 5 minutes.</p>

//             <p>
//               If you did not request an email change,
//               please ignore this email.
//             </p>
//           `,
//         }),
//       }
//     );

//     const data = await response.json();
//     console.log("BREVO STATUS:", response.status, data);

//     if (!response.ok) {
//       console.error("BREVO ERROR:", data);

//       return res.status(502).json({
//         status: false,
//         message: "Failed to send OTP email",
//       });
//     }

//     user.emailChangeOtp = otp;
//     user.emailChangeOtpExpiresAt = otpExpiresAt;
//     user.emailChangeVerified = false;

//     await user.save();

//     return res.status(200).json({
//       status: true,
//       message: "OTP sent successfully to your current email",
//     });
//   } catch (error) {
//     console.error("sendEmailChangeOTP Error:", error);

//     return res.status(500).json({
//       status: false,
//       message: "Something went wrong. Please try again.",
//     });
//   }
// };



// export const verifyEmailChangeOTP = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { otp } = req.body;

//     if (!otp) {
//       return res.status(400).json({
//         status: false,
//         message: "OTP is required",
//       });
//     }

//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({
//         status: false,
//         message: "User not found",
//       });
//     }

//     if (!user.emailChangeOtp) {
//       return res.status(400).json({
//         status: false,
//         message: "OTP is invalid",
//       });
//     }

//     if (
//       !user.emailChangeOtpExpiresAt ||
//       user.emailChangeOtpExpiresAt < Date.now()
//     ) {
//       return res.status(400).json({
//         status: false,
//         message: "OTP is expired",
//       });
//     }

//     if (user.emailChangeOtp !== otp.toString()) {
//       return res.status(400).json({
//         status: false,
//         message: "OTP is invalid",
//       });
//     }

//     user.emailChangeOtp = null;
//     user.emailChangeOtpExpiresAt = null;
//     user.emailChangeVerified = true;

//     await user.save();

//     return res.status(200).json({
//       status: true,
//       message: "OTP verified successfully",
//     });
//   } catch (error) {
//     console.error("verifyEmailChangeOTP Error:", error);

//     return res.status(500).json({
//       status: false,
//       message: "Something went wrong. Please try again.",
//     });
//   }
// }


// export const changeUserEmail = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { newEmail } = req.body;

//     if (!newEmail) {
//       return res.status(400).json({
//         status: false,
//         message: "New email is required",
//       });
//     }

//     const cleanNewEmail = newEmail.trim().toLowerCase();

//     const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|net|edu|gov|in|co|io|me)$/i;

//     if (!emailRegex.test(cleanNewEmail)) {
//       return res.status(400).json({
//         status: false,
//         message: "Please enter a valid email address",
//       });
//     }

//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({
//         status: false,
//         message: "User not found",
//       });
//     }

//     // OTP verification is mandatory
//     if (!user.emailChangeVerified) {
//       return res.status(403).json({
//         status: false,
//         message: "Please verify the OTP before changing your email",
//       });
//     }

//     if (cleanNewEmail === user.email.toLowerCase()) {
//       return res.status(400).json({
//         status: false,
//         message:
//           "New email must be different from your current email",
//       });
//     }

//     const existingUser = await User.findOne({
//       email: cleanNewEmail,
//       _id: { $ne: user._id },
//     });

//     if (existingUser) {
//       return res.status(409).json({
//         status: false,
//         message: "An account with this email already exists",
//       });
//     }

//     user.email = cleanNewEmail;

//     // Consume the verification
//     user.emailChangeVerified = false;
//     user.emailChangeOtp = null;
//     user.emailChangeOtpExpiresAt = null;

//     await user.save();

//     const { password, ...userData } = user.toObject();

//     return res.status(200).json({
//       status: true,
//       message: "Email changed successfully",
//       user: userData,
//     });
//   } catch (error) {
//     console.error("changeUserEmail Error:", error);

//     return res.status(500).json({
//       status: false,
//       message: "Something went wrong. Please try again.",
//     });
//   }
// }

// export const sendPasswordChangeOTP = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({
//         status: false,
//         message: "User not found",
//       });
//     }

//     if (
//       !process.env.BREVO_API_KEY ||
//       !process.env.BREVO_SENDER_EMAIL
//     ) {
//       return res.status(500).json({
//         status: false,
//         message: "Email configuration is missing on server",
//       });
//     }

//     const otp = generateOTP();

//     const otpExpiresAt = new Date(
//       Date.now() + 5 * 60 * 1000
//     );

//     const response = await fetch(
//       "https://api.brevo.com/v3/smtp/email",
//       {
//         method: "POST",
//         headers: {
//           accept: "application/json",
//           "api-key": process.env.BREVO_API_KEY,
//           "content-type": "application/json",
//         },
//         body: JSON.stringify({
//           sender: {
//             name: "Chronos Haute Horlogerie",
//             email: process.env.BREVO_SENDER_EMAIL,
//           },
//           to: [
//             {
//               email: user.email,
//             },
//           ],
//           subject: "Chronos - Password Change Verification",
//           htmlContent: `
//             <h2>Password Change Verification</h2>
//             <p>Hello ${user.firstName},</p>

//             <p>
//               Use the OTP below to verify your identity
//               before changing your Chronos account password.
//             </p>

//             <h1>${otp}</h1>

//             <p>This OTP is valid for 5 minutes.</p>

//             <p>
//               If you did not request a password change,
//               please ignore this email.
//             </p>
//           `,
//         }),
//       }
//     );

//     const data = await response.json();

//     console.log("PASSWORD OTP BREVO STATUS:", response.status, data);

//     if (!response.ok) {
//       console.error("PASSWORD OTP BREVO ERROR:", data);

//       return res.status(502).json({
//         status: false,
//         message: "Failed to send OTP email",
//       });
//     }

//     user.passwordChangeOtp = otp;
//     user.passwordChangeOtpExpiresAt = otpExpiresAt;
//     user.passwordChangeVerified = false;

//     await user.save();

//     return res.status(200).json({
//       status: true,
//       message: "OTP sent successfully to your current email",
//     });
//   } catch (error) {
//     console.error("sendPasswordChangeOTP Error:", error);

//     return res.status(500).json({
//       status: false,
//       message: "Something went wrong. Please try again.",
//     });
//   }
// }

// export const verifyPasswordChangeOTP = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { otp } = req.body;

//     if (!otp) {
//       return res.status(400).json({
//         status: false,
//         message: "OTP is required",
//       });
//     }

//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({
//         status: false,
//         message: "User not found",
//       });
//     }

//     if (!user.passwordChangeOtp) {
//       return res.status(400).json({
//         status: false,
//         message: "OTP is invalid",
//       });
//     }

//     if (
//       !user.passwordChangeOtpExpiresAt ||
//       user.passwordChangeOtpExpiresAt < Date.now()
//     ) {
//       return res.status(400).json({
//         status: false,
//         message: "OTP is expired",
//       });
//     }

//     if (user.passwordChangeOtp !== otp.toString()) {
//       return res.status(400).json({
//         status: false,
//         message: "OTP is invalid",
//       });
//     }

//     user.passwordChangeOtp = null;
//     user.passwordChangeOtpExpiresAt = null;
//     user.passwordChangeVerified = true;

//     await user.save();

//     return res.status(200).json({
//       status: true,
//       message: "OTP verified successfully",
//     });
//   } catch (error) {
//     console.error("verifyPasswordChangeOTP Error:", error);

//     return res.status(500).json({
//       status: false,
//       message: "Something went wrong. Please try again.",
//     });
//   }
// <<<<<<< HEAD
// }
// // =============================================
// // MOBILE NUMBER UPDATE WITH OTP VERIFICATION
// // =============================================

// export const sendMobileChangeOTP = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { newMobileNumber } = req.body;

//     // Validation
//     if (!newMobileNumber) {
//       return res.status(400).json({
//         status: false,
//         message: "New mobile number is required",
//       });
//     }

//     // Validate 10-digit mobile number
//     if (!/^\d{10}$/.test(newMobileNumber)) {
//       return res.status(400).json({
//         status: false,
//         message: "Mobile number must be exactly 10 digits",
//       });
//     }

//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({
//         status: false,
//         message: "User not found",
//       });
//     }

//     // Check if new mobile is same as current
//     if (newMobileNumber === user.mobileNumber) {
//       return res.status(400).json({
//         status: false,
//         message: "New mobile number cannot be same as current number",
//       });
//     }

//     // Check if mobile already exists for another user
//     const existingUser = await User.findOne({
//       mobileNumber: newMobileNumber,
//       _id: { $ne: user._id },
//     });

//     if (existingUser) {
//       return res.status(409).json({
//         status: false,
//         message: "This mobile number is already registered to another account",
//       });
//     }

//     // Check if Brevo is configured
//     if (
//       !process.env.BREVO_API_KEY ||
//       !process.env.BREVO_SENDER_EMAIL
//     ) {
//       return res.status(500).json({
//         status: false,
//         message: "Email configuration is missing on server",
//       });
//     }

//     // Generate OTP
//     const otp = generateOTP();

//     const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

//     // Send email via Brevo
//     const response = await fetch(
//       "https://api.brevo.com/v3/smtp/email",
//       {
//         method: "POST",
//         headers: {
//           accept: "application/json",
//           "api-key": process.env.BREVO_API_KEY,
//           "content-type": "application/json",
//         },
//         body: JSON.stringify({
//           sender: {
//             name: "Chronos Haute Horlogerie",
//             email: process.env.BREVO_SENDER_EMAIL,
//           },
//           to: [
//             {
//               email: user.email,
//             },
//           ],
//           subject: "Chronos - Mobile Number Verification",
//           htmlContent: `
//             <h2>Mobile Number Verification</h2>

//             <p>Hello ${user.firstName},</p>

//             <p>
//               Use the OTP below to verify your new mobile number
//               for your Chronos account.
//             </p>

//             <h1 style="letter-spacing: 5px; color: #333;">${otp}</h1>

//             <p><strong>New Mobile Number:</strong> ${newMobileNumber}</p>

//             <p>This OTP is valid for 5 minutes.</p>

//             <p>
//               If you did not request a mobile number change,
//               please ignore this email.
//             </p>
//           `,
//         }),
//       }
//     );

//     const data = await response.json();

//     console.log("MOBILE OTP BREVO STATUS:", response.status, data);

//     if (!response.ok) {
//       console.error("MOBILE OTP BREVO ERROR:", data);

//       return res.status(502).json({
//         status: false,
//         message: "Failed to send OTP email",
//       });
//     }

//     // Save OTP to user
//     user.mobileChangeOtp = otp;
//     user.mobileChangeOtpExpiresAt = otpExpiresAt;
//     user.mobileChangeVerified = false;

//     // Store the new mobile temporarily
//     user._tempNewMobileNumber = newMobileNumber;

//     await user.save();

//     return res.status(200).json({
//       status: true,
//       message: "OTP sent successfully to your registered email",
//     });

//   } catch (error) {
//     console.error("sendMobileChangeOTP Error:", error);

//     return res.status(500).json({
//       status: false,
//       message: "Something went wrong. Please try again.",
//     });
//   }
// };


// export const verifyMobileChangeOTP = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { otp, newMobileNumber } = req.body;

//     // Validation
//     if (!otp) {
//       return res.status(400).json({
//         status: false,
//         message: "OTP is required",
//       });
//     }

//     if (!newMobileNumber) {
//       return res.status(400).json({
//         status: false,
//         message: "New mobile number is required",
//       });
//     }

//     // Validate OTP format (6 digits)
//     if (!/^\d{6}$/.test(otp)) {
//       return res.status(400).json({
//         status: false,
//         message: "OTP must be 6 digits",
//       });
//     }

//     // Validate mobile format (10 digits)
//     if (!/^\d{10}$/.test(newMobileNumber)) {
//       return res.status(400).json({
//         status: false,
//         message: "Mobile number must be 10 digits",
//       });
//     }

//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({
//         status: false,
//         message: "User not found",
//       });
//     }

//     // Check if OTP was requested
//     if (!user.mobileChangeOtp) {
//       return res.status(400).json({
//         status: false,
//         message: "OTP is invalid or not requested",
//       });
//     }

//     // Check if OTP is expired
//     if (
//       !user.mobileChangeOtpExpiresAt ||
//       user.mobileChangeOtpExpiresAt < Date.now()
//     ) {
//       return res.status(400).json({
//         status: false,
//         message: "OTP is expired. Please request a new OTP.",
//       });
//     }

//     // Verify OTP
//     if (user.mobileChangeOtp !== otp.toString()) {
//       return res.status(400).json({
//         status: false,
//         message: "OTP is incorrect",
//       });
//     }

//     // Mark as verified (not consuming yet)
//     user.mobileChangeVerified = true;

//     await user.save();

//     return res.status(200).json({
//       status: true,
//       message: "OTP verified successfully",
//     });

//   } catch (error) {
//     console.error("verifyMobileChangeOTP Error:", error);

//     return res.status(500).json({
//       status: false,
//       message: "Something went wrong. Please try again.",
//     });
//   }
// };


// export const updateMobileNumber = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { newMobileNumber } = req.body;

//     if (!newMobileNumber) {
//       return res.status(400).json({
//         status: false,
//         message: "New mobile number is required",
//       });
//     }

//     // Validate mobile format
//     if (!/^\d{10}$/.test(newMobileNumber)) {
//       return res.status(400).json({
//         status: false,
//         message: "Mobile number must be 10 digits",
//       });
//     }

//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({
//         status: false,
//         message: "User not found",
//       });
//     }

//     // OTP verification is mandatory
//     if (!user.mobileChangeVerified) {
//       return res.status(403).json({
//         status: false,
//         message: "Please verify OTP before updating mobile number",
//       });
//     }

//     // Double-check mobile is not same
//     if (newMobileNumber === user.mobileNumber) {
//       return res.status(400).json({
//         status: false,
//         message: "New mobile must be different from current mobile",
//       });
//     }

//     // Check if mobile already exists
//     const existingUser = await User.findOne({
//       mobileNumber: newMobileNumber,
//       _id: { $ne: user._id },
//     });

//     if (existingUser) {
//       return res.status(409).json({
//         status: false,
//         message: "This mobile number is already registered",
//       });
//     }

//     // Update mobile number
//     user.mobileNumber = newMobileNumber;
//     user.mobileVerifiedAt = new Date();

//     // Consume the verification
//     user.mobileChangeVerified = false;
//     user.mobileChangeOtp = null;
//     user.mobileChangeOtpExpiresAt = null;

//     await user.save();

//     const { password, ...userData } = user.toObject();

//     return res.status(200).json({
//       status: true,
//       message: "Mobile number updated successfully",
//       user: userData,
//     });

//   } catch (error) {
//     console.error("updateMobileNumber Error:", error);

//     return res.status(500).json({
//       status: false,
//       message: "Something went wrong. Please try again.",
//     });
// =======
// };

// // ==========================================
// // USER SESSIONS / ACTIVE DEVICES
// // ==========================================
// export const getUserSessions = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const currentSessionId = req.user.sessionId;

//     const user = await User.findById(userId).select("sessions");
//     if (!user) {
//       return res.status(404).json({ status: false, message: "User not found" });
//     }

//     const sessions = (user.sessions || []).map((s) => ({
//       sessionId: s.sessionId,
//       device: s.device,
//       browser: s.browser,
//       os: s.os,
//       deviceType: s.deviceType || "Desktop",
//       ipAddress: s.ipAddress,
//       lastActive: s.lastActive,
//       createdAt: s.createdAt,
//       isCurrent: s.sessionId === currentSessionId,
//     }));

//     // Sort so current session is first, then most recently active
//     sessions.sort((a, b) => {
//       if (a.isCurrent) return -1;
//       if (b.isCurrent) return 1;
//       return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
//     });

//     return res.status(200).json({
//       status: true,
//       message: "Sessions fetched successfully",
//       sessions,
//     });
//   } catch (error) {
//     console.error("getUserSessions Error:", error);
//     return res.status(500).json({ status: false, message: error.message });
//   }
// };

// export const deleteUserSession = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { sessionId } = req.params;
//     const currentSessionId = req.user.sessionId;

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ status: false, message: "User not found" });
//     }

//     user.sessions = (user.sessions || []).filter(
//       (s) => s.sessionId !== sessionId
//     );

//     await user.save();

//     const isCurrentDeleted = sessionId === currentSessionId;

//     const remainingSessions = user.sessions.map((s) => ({
//       sessionId: s.sessionId,
//       device: s.device,
//       browser: s.browser,
//       os: s.os,
//       deviceType: s.deviceType || "Desktop",
//       ipAddress: s.ipAddress,
//       lastActive: s.lastActive,
//       createdAt: s.createdAt,
//       isCurrent: s.sessionId === currentSessionId,
//     }));

//     return res.status(200).json({
//       status: true,
//       message: "Session terminated successfully",
//       isCurrentDeleted,
//       sessions: remainingSessions,
//     });
//   } catch (error) {
//     console.error("deleteUserSession Error:", error);
//     return res.status(500).json({ status: false, message: error.message });
//   }
// };

// export const logoutOtherSessions = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const currentSessionId = req.user.sessionId;

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ status: false, message: "User not found" });
//     }

//     user.sessions = (user.sessions || []).filter(
//       (s) => s.sessionId === currentSessionId
//     );

//     await user.save();

//     const remainingSessions = user.sessions.map((s) => ({
//       sessionId: s.sessionId,
//       device: s.device,
//       browser: s.browser,
//       os: s.os,
//       deviceType: s.deviceType || "Desktop",
//       ipAddress: s.ipAddress,
//       lastActive: s.lastActive,
//       createdAt: s.createdAt,
//       isCurrent: true,
//     }));

//     return res.status(200).json({
//       status: true,
//       message: "All other sessions signed out successfully",
//       sessions: remainingSessions,
//     });
//   } catch (error) {
//     console.error("logoutOtherSessions Error:", error);
//     return res.status(500).json({ status: false, message: error.message });
// >>>>>>> main
//   }
// };
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

    const allowedFields = ["firstName", "lastName", "password", "dob", "gender", "countryCode", "mobileNumber"];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === "dob") {
          if (req.body.dob) {
            const parsedDate = new Date(req.body.dob);
            if (isNaN(parsedDate.getTime())) {
              return res.status(400).json({ status: false, message: "Invalid date of birth" });
            }
            const now = new Date();
            if (parsedDate > now) {
              return res.status(400).json({ status: false, message: "Date of birth cannot be in the future" });
            }
            const thirteenYearsAgo = new Date();
            thirteenYearsAgo.setFullYear(thirteenYearsAgo.getFullYear() - 13);
            if (parsedDate > thirteenYearsAgo) {
              return res.status(400).json({ status: false, message: "You must be at least 13 years old" });
            }
            const minDate = new Date();
            minDate.setFullYear(minDate.getFullYear() - 120);
            if (parsedDate < minDate) {
              return res.status(400).json({ status: false, message: "Please enter a valid date of birth" });
            }
            updates.dob = parsedDate;
          } else {
            updates.dob = null;
          }
        } else if (field === "gender") {
          const validGenders = ["Male", "Female", "Other", "Prefer not to say", ""];
          if (!validGenders.includes(req.body.gender)) {
            return res.status(400).json({ status: false, message: "Invalid gender selection" });
          }
          updates.gender = req.body.gender;
        } else {
          updates[field] = req.body[field];
        }
      }
    }

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

// =============================================
// MOBILE NUMBER UPDATE WITH OTP VERIFICATION
// =============================================

export const sendMobileChangeOTP = async (req, res) => {
  try {
    const userId = req.user.id;
    const { newMobileNumber } = req.body;

    // Validation
    if (!newMobileNumber) {
      return res.status(400).json({
        status: false,
        message: "New mobile number is required",
      });
    }

    // Validate 10-digit mobile number
    if (!/^\d{10}$/.test(newMobileNumber)) {
      return res.status(400).json({
        status: false,
        message: "Mobile number must be exactly 10 digits",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    // Check if new mobile is same as current
    if (newMobileNumber === user.mobileNumber) {
      return res.status(400).json({
        status: false,
        message: "New mobile number cannot be same as current number",
      });
    }

    // Check if mobile already exists for another user
    const existingUser = await User.findOne({
      mobileNumber: newMobileNumber,
      _id: { $ne: user._id },
    });

    if (existingUser) {
      return res.status(409).json({
        status: false,
        message: "This mobile number is already registered to another account",
      });
    }

    // Check if Brevo is configured
    if (
      !process.env.BREVO_API_KEY ||
      !process.env.BREVO_SENDER_EMAIL
    ) {
      return res.status(500).json({
        status: false,
        message: "Email configuration is missing on server",
      });
    }

    // Generate OTP
    const otp = generateOTP();

    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Send email via Brevo
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
          subject: "Chronos - Mobile Number Verification",
          htmlContent: `
            <h2>Mobile Number Verification</h2>

            <p>Hello ${user.firstName},</p>

            <p>
              Use the OTP below to verify your new mobile number
              for your Chronos account.
            </p>

            <h1 style="letter-spacing: 5px; color: #333;">${otp}</h1>

            <p><strong>New Mobile Number:</strong> ${newMobileNumber}</p>

            <p>This OTP is valid for 5 minutes.</p>

            <p>
              If you did not request a mobile number change,
              please ignore this email.
            </p>
          `,
        }),
      }
    );

    const data = await response.json();

    console.log("MOBILE OTP BREVO STATUS:", response.status, data);

    if (!response.ok) {
      console.error("MOBILE OTP BREVO ERROR:", data);

      return res.status(502).json({
        status: false,
        message: "Failed to send OTP email",
      });
    }

    // Save OTP to user
    user.mobileChangeOtp = otp;
    user.mobileChangeOtpExpiresAt = otpExpiresAt;
    user.mobileChangeVerified = false;

    // Store the new mobile temporarily
    user._tempNewMobileNumber = newMobileNumber;

    await user.save();

    return res.status(200).json({
      status: true,
      message: "OTP sent successfully to your registered email",
    });

  } catch (error) {
    console.error("sendMobileChangeOTP Error:", error);

    return res.status(500).json({
      status: false,
      message: "Something went wrong. Please try again.",
    });
  }
};


export const verifyMobileChangeOTP = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otp, newMobileNumber } = req.body;

    // Validation
    if (!otp) {
      return res.status(400).json({
        status: false,
        message: "OTP is required",
      });
    }

    if (!newMobileNumber) {
      return res.status(400).json({
        status: false,
        message: "New mobile number is required",
      });
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        status: false,
        message: "OTP must be 6 digits",
      });
    }

    // Validate mobile format (10 digits)
    if (!/^\d{10}$/.test(newMobileNumber)) {
      return res.status(400).json({
        status: false,
        message: "Mobile number must be 10 digits",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    // Check if OTP was requested
    if (!user.mobileChangeOtp) {
      return res.status(400).json({
        status: false,
        message: "OTP is invalid or not requested",
      });
    }

    // Check if OTP is expired
    if (
      !user.mobileChangeOtpExpiresAt ||
      user.mobileChangeOtpExpiresAt < Date.now()
    ) {
      return res.status(400).json({
        status: false,
        message: "OTP is expired. Please request a new OTP.",
      });
    }

    // Verify OTP
    if (user.mobileChangeOtp !== otp.toString()) {
      return res.status(400).json({
        status: false,
        message: "OTP is incorrect",
      });
    }

    // Mark as verified (not consuming yet)
    user.mobileChangeVerified = true;

    await user.save();

    return res.status(200).json({
      status: true,
      message: "OTP verified successfully",
    });

  } catch (error) {
    console.error("verifyMobileChangeOTP Error:", error);

    return res.status(500).json({
      status: false,
      message: "Something went wrong. Please try again.",
    });
  }
};


export const updateMobileNumber = async (req, res) => {
  try {
    const userId = req.user.id;
    const { newMobileNumber } = req.body;

    if (!newMobileNumber) {
      return res.status(400).json({
        status: false,
        message: "New mobile number is required",
      });
    }

    // Validate mobile format
    if (!/^\d{10}$/.test(newMobileNumber)) {
      return res.status(400).json({
        status: false,
        message: "Mobile number must be 10 digits",
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
    if (!user.mobileChangeVerified) {
      return res.status(403).json({
        status: false,
        message: "Please verify OTP before updating mobile number",
      });
    }

    // Double-check mobile is not same
    if (newMobileNumber === user.mobileNumber) {
      return res.status(400).json({
        status: false,
        message: "New mobile must be different from current mobile",
      });
    }

    // Check if mobile already exists
    const existingUser = await User.findOne({
      mobileNumber: newMobileNumber,
      _id: { $ne: user._id },
    });

    if (existingUser) {
      return res.status(409).json({
        status: false,
        message: "This mobile number is already registered",
      });
    }

    // Update mobile number
    user.mobileNumber = newMobileNumber;
    user.mobileVerifiedAt = new Date();

    // Consume the verification
    user.mobileChangeVerified = false;
    user.mobileChangeOtp = null;
    user.mobileChangeOtpExpiresAt = null;

    await user.save();

    const { password, ...userData } = user.toObject();

    return res.status(200).json({
      status: true,
      message: "Mobile number updated successfully",
      user: userData,
    });

  } catch (error) {
    console.error("updateMobileNumber Error:", error);

    return res.status(500).json({
      status: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

// ==========================================
// USER SESSIONS / ACTIVE DEVICES
// ==========================================
export const getUserSessions = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentSessionId = req.user.sessionId;

    const user = await User.findById(userId).select("sessions");
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const sessions = (user.sessions || []).map((s) => ({
      sessionId: s.sessionId,
      device: s.device,
      browser: s.browser,
      os: s.os,
      deviceType: s.deviceType || "Desktop",
      ipAddress: s.ipAddress,
      lastActive: s.lastActive,
      createdAt: s.createdAt,
      isCurrent: s.sessionId === currentSessionId,
    }));

    // Sort so current session is first, then most recently active
    sessions.sort((a, b) => {
      if (a.isCurrent) return -1;
      if (b.isCurrent) return 1;
      return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
    });

    return res.status(200).json({
      status: true,
      message: "Sessions fetched successfully",
      sessions,
    });
  } catch (error) {
    console.error("getUserSessions Error:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const deleteUserSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId } = req.params;
    const currentSessionId = req.user.sessionId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    user.sessions = (user.sessions || []).filter(
      (s) => s.sessionId !== sessionId
    );

    await user.save();

    const isCurrentDeleted = sessionId === currentSessionId;

    const remainingSessions = user.sessions.map((s) => ({
      sessionId: s.sessionId,
      device: s.device,
      browser: s.browser,
      os: s.os,
      deviceType: s.deviceType || "Desktop",
      ipAddress: s.ipAddress,
      lastActive: s.lastActive,
      createdAt: s.createdAt,
      isCurrent: s.sessionId === currentSessionId,
    }));

    return res.status(200).json({
      status: true,
      message: "Session terminated successfully",
      isCurrentDeleted,
      sessions: remainingSessions,
    });
  } catch (error) {
    console.error("deleteUserSession Error:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const logoutOtherSessions = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentSessionId = req.user.sessionId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    user.sessions = (user.sessions || []).filter(
      (s) => s.sessionId === currentSessionId
    );

    await user.save();

    const remainingSessions = user.sessions.map((s) => ({
      sessionId: s.sessionId,
      device: s.device,
      browser: s.browser,
      os: s.os,
      deviceType: s.deviceType || "Desktop",
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
    console.error("logoutOtherSessions Error:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const logoutAllSessions = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    user.sessions = [];
    await user.save();

    return res.status(200).json({
      status: true,
      message: "All sessions logged out successfully",
      isCurrentDeleted: true,
      sessions: [],
    });
  } catch (error) {
    console.error("logoutAllSessions Error:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const getUserLoginActivity = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("loginActivities");
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const activities = user.loginActivities || [];
    const totalLogins = activities.length;
    const failedLogins = activities.filter((a) => a.status === "Failed" || a.status === "Blocked").length;
    const suspiciousCount = activities.filter((a) => a.isSuspicious).length;

    return res.status(200).json({
      status: true,
      message: "Login activity retrieved successfully",
      activities,
      stats: {
        totalLogins,
        failedLogins,
        suspiciousCount,
      },
    });
  } catch (error) {
    console.error("getUserLoginActivity Error:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};