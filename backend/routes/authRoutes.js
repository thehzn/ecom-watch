import express from "express"
import { login, register, resetPassword, verifyOtp } from "../controllers/authControllers.js"
import { sendOTP } from "../utils/sendEmail.js"
import passport from "../config/passport.js"
import jwt from "jsonwebtoken"



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
    failureRedirect: "/apiauth/user/login",
  }),
  (req, res) => {
    const userToken = jwt.sign(
      {
        id: req.user._id,
        role: req.user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
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
      `http://localhost:5173/login?token=${userToken}&user=${userData}`
    );
  }
);
export default router








