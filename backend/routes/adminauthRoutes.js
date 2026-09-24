import express from "express"
import { Adminlogin, changeAdminEmail, resetAdminPassword, sendAdminEmailChangeOTP, verifyAdminEmailChangeOTP, verifyAdminOtp } from "../controllers/adminauthControllers.js"
import { sendAdminOTP } from "../utils/sendAdminEmail.js"
import { verifyAdmin } from "../middleware/AdminVerify.js"
import passport from "../config/passport.js"
import jwt from "jsonwebtoken"

const router = express.Router()
router.post("/admin/login",Adminlogin)

router.post("/admin/sendotp",sendAdminOTP)
router.post("/admin/verifyotp",verifyAdminOtp)
router.post("/admin/resetadminpassword",resetAdminPassword)


router.post("/admin/change-email", verifyAdmin, sendAdminEmailChangeOTP)
router.post("/admin/verify-email", verifyAdmin, verifyAdminEmailChangeOTP)
router.post("/admin/update-email",verifyAdmin,changeAdminEmail)


router.get(
  "/google/admin",
  passport.authenticate("google-admin", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/admin/callback",
  passport.authenticate("google-admin", {
    session: false,
    failureRedirect: "/admin/login",
  }),
  (req, res) => {
    const adminToken = jwt.sign(
      {
        id: req.user._id,
        role: "admin",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    const adminData = encodeURIComponent(
      JSON.stringify({
        email: req.user.email,
        role: "admin",
      })
    );

    return res.redirect(
      `http://localhost:5173/admin/login?token=${adminToken}&user=${adminData}`
    );
  }
);



export default router