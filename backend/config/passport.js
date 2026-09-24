import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/UserModel.js";
import Admin from "../models/AdminModel.js";


passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/apiauth/google/callback",
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const googleId = profile.id;

        if (!email) {
          return done(new Error("Google account email not available"), null);
        }

        let user = await User.findOne({
          $or: [{ googleId }, { email }],
        });

        if (user) {
          // Link Google account if this email already exists
          if (!user.googleId) {
            user.googleId = googleId;
            user.authProvider = "google";
            await user.save();
          }

          return done(null, user);
        }

        const firstName =
          profile.name?.givenName ||
          profile.displayName?.split(" ")[0] ||
          "Google";

        const lastName =
          profile.name?.familyName ||
          profile.displayName?.split(" ").slice(1).join(" ") ||
          "User";

        user = await User.create({
          firstName,
          lastName,
          email,
          googleId,
          authProvider: "google",
          countryCode: "+91",
          mobileNumber: "",
          role: "user",
        });

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
)


passport.use(
  "google-admin",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/apiadmin/google/admin/callback",
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const googleId = profile.id;

        if (!email) {
          return done(
            new Error("Google account email not available"),
            null
          );
        }

        // Find existing admin by Google ID
        let admin = await Admin.findOne({ googleId });

        if (admin) {
          return done(null, admin);
        }

        // If Google ID is not linked yet,
        // find admin using the current email
        admin = await Admin.findOne({
          email: email.toLowerCase().trim(),
        });

        if (!admin) {
          return done(
            new Error("This Google account is not registered as an admin"),
            null
          );
        }

        // Link Google account to existing admin
        admin.googleId = googleId;
        await admin.save();

        return done(null, admin);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);


export default passport;