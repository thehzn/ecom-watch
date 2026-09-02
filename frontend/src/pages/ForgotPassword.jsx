
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import {Mail,ArrowLeft,Eye,EyeOff,Check,ArrowRight} from "lucide-react";
import { useApi } from "../hooks/useApi";

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

const LIVE_RULES = [
  {
    key: "length",
    label: "Minimum 8 characters",
    test: (v) => v.length >= 8,
  },
  {
    key: "upper",
    label: "1 uppercase & 1 lowercase letter",
    test: (v) => /[A-Z]/.test(v) && /[a-z]/.test(v),
  },
  {
    key: "numberOrSymbol",
    label: "1 number & 1 special symbol",
    test: (v) => /\d/.test(v) && /[^A-Za-z0-9]/.test(v),
  },
];

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { post } = useApi();

  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [submitError, setSubmitError] = useState("");

  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const emailForm = useFormik({
    initialValues: {
      email: "",
    },

    validationSchema: Yup.object({
      email: Yup.string()
        .transform((value) =>
          value ? value.trim().toLowerCase() : value
        )
        .email("Enter a valid email address")
        .required("Email is required"),
    }),

    onSubmit: async (values, { setSubmitting }) => {
      setSubmitError("");

      const normalizedEmail = values.email.trim().toLowerCase();

      try {
        await post("/apiauth/user/sendotp", {
          email: normalizedEmail,
        });

        setEmail(normalizedEmail);
        setStep("otp");
      } catch (err) {
        if (
          (err.message || "")
            .toLowerCase()
            .includes("invalid mail")
        ) {
          setEmail(normalizedEmail);
          setStep("otp");
        } else {
          setSubmitError(
            err.message || "Something went wrong. Please try again."
          );
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  const otpForm = useFormik({
    initialValues: {
      otp: "",
    },

    validationSchema: Yup.object({
      otp: Yup.string()
        .matches(
          /^\d{6}$/,
          "Enter the 6-digit verification code"
        )
        .required("Verification code is required"),
    }),

    onSubmit: async (values, { setSubmitting }) => {
      setSubmitError("");

      try {
        const data = await post(
          "/apiauth/user/verifyotp",
          {
            email,
            otp: values.otp,
          }
        );

        setResetToken(data.resetToken);
        setStep("reset");
      } catch (err) {
        setSubmitError(
          err.message || "Invalid or expired verification code."
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleResend = async () => {
    setSubmitError("");

    try {
      await post("/apiauth/user/sendotp", {
        email,
      });
    } catch (err) {
      setSubmitError(
        err.message || "Could not resend the verification code."
      );
    }
  };

  const resetForm = useFormik({
    initialValues: {
      newPassword: "",
      confirmPassword: "",
    },

    validationSchema: Yup.object({
      newPassword: Yup.string()
        .required("New password is required")
        .matches(
          passwordRegex,
          "Password must contain 8+ characters, uppercase, lowercase, number and special character"
        ),

      confirmPassword: Yup.string()
        .required("Please confirm your password")
        .oneOf(
          [Yup.ref("newPassword")],
          "Passwords do not match"
        ),
    }),

    onSubmit: async (values, { setSubmitting }) => {
      setSubmitError("");

      try {
        await post(
          "/apiauth/user/resetpassword",
          {
            resetToken,
            password: values.newPassword,
            confirmPassword: values.confirmPassword,
          }
        );

        setStep("done");

        setTimeout(() => {
          navigate("/login");
        }, 1800);
      } catch (err) {
        setSubmitError(
          err.message ||
            "Your reset session has expired. Please try again."
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  const ErrorMessage = () => {
    if (!submitError) return null;

    return (
      <div className="border border-red-300 bg-red-50 px-4 py-3 text-xs text-red-600">
        {submitError}
      </div>
    );
  };

  return (
    <main className="min-h-screen w-full bg-white text-black flex">

      {/* LEFT */}

      <section className="hidden lg:flex lg:w-[42%] min-h-screen bg-black text-white flex-col justify-between">

        <header className="px-12 pt-10">
          <Link
            to="/"
            className="text-3xl font-semibold tracking-[0.28em]"
          >
            CHRONOS
          </Link>
        </header>

        <div className="px-12">

          <h2 className="text-5xl font-light tracking-[-0.05em] leading-tight">
            Forgot
            <br />
            <span className="text-white/40">
              Password?
            </span>
          </h2>

          <div className="mt-10 w-32 h-32 border border-white/20 rounded-full flex items-center justify-center">

            <div className="w-20 h-20 border border-white/10 rounded-full flex items-center justify-center">

              <div className="w-2 h-2 bg-white rounded-full" />

            </div>

          </div>

        </div>

        <footer className="px-12 pb-10">

          <div className="border-t border-white/10 pt-5">

            <span className="text-xs text-white/30">
              CHRONOS
            </span>

          </div>

        </footer>

      </section>


      {/* RIGHT */}

      <section className="w-full lg:w-[58%] min-h-screen bg-white flex flex-col">

        <header className="px-6 sm:px-10 lg:px-14 py-7 border-b border-black/10 flex justify-between items-center">

          <Link
            to="/"
            className="lg:hidden text-xl font-semibold tracking-[0.25em]"
          >
            CHRONOS
          </Link>

          <div className="hidden lg:block" />

        </header>


        <div className="flex-1 flex items-center justify-center px-6 sm:px-10 lg:px-16 py-12">

          <div className="w-full max-w-[500px]">


            {/* EMAIL */}

            {step === "email" && (

              <div>

                <h1 className="text-4xl sm:text-5xl font-light tracking-[-0.05em]">
                  Forgot
                  <br />
                  <span className="text-black/40">
                    Password?
                  </span>
                </h1>

                <p className="mt-5 text-sm text-black/50">
                  Enter your email address to receive a verification code.
                </p>


                <form
                  onSubmit={emailForm.handleSubmit}
                  noValidate
                  className="mt-8 space-y-5"
                >

                  <div>

                    <label
                      htmlFor="email"
                      className="block text-xs font-medium mb-2"
                    >
                      Email
                    </label>

                    <div className="relative">

                      <Mail
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30"
                      />

                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        autoComplete="email"
                        value={emailForm.values.email}
                        onChange={emailForm.handleChange}
                        onBlur={emailForm.handleBlur}
                        className={`w-full h-14 border ${
                          emailForm.touched.email &&
                          emailForm.errors.email
                            ? "border-red-400"
                            : "border-black/15"
                        } pl-11 pr-4 outline-none focus:border-black`}
                      />

                    </div>

                    {emailForm.touched.email &&
                      emailForm.errors.email && (
                        <p className="mt-2 text-xs text-red-600">
                          {emailForm.errors.email}
                        </p>
                      )}

                  </div>


                  <ErrorMessage />


                  <button
                    type="submit"
                    disabled={emailForm.isSubmitting}
                    className="w-full h-14 bg-black text-white flex items-center justify-center gap-3 text-xs font-semibold hover:bg-black/85 disabled:opacity-50"
                  >

                    {emailForm.isSubmitting
                      ? "Sending..."
                      : "Send Verification Code"}

                    {!emailForm.isSubmitting && (
                      <ArrowRight size={15} />
                    )}

                  </button>


                  <Link
                    to="/login"
                    className="flex items-center justify-center gap-2 text-xs text-black/90 hover:text-black"
                  >
                    <ArrowLeft size={13} />
                    Back to Login
                  </Link>

                </form>

              </div>

            )}


            {/* OTP */}

            {step === "otp" && (

              <div>

                <h1 className="text-4xl sm:text-5xl font-light tracking-[-0.05em]">
                  Verify
                  <br />
                  <span className="text-black/40">
                    OTP
                  </span>
                </h1>

                <p className="mt-5 text-sm text-black/50">
                  Enter the 6-digit code sent to
                  <br />
                  <span className="text-black font-medium">
                    {email}
                  </span>
                </p>


                <form
                  onSubmit={otpForm.handleSubmit}
                  noValidate
                  className="mt-8 space-y-5"
                >

                  <div>

                    <label
                      htmlFor="otp"
                      className="block text-xs font-medium mb-2"
                    >
                      Verification Code
                    </label>

                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="000000"
                      value={otpForm.values.otp}
                      onChange={(e) => {
                        const value =
                          e.target.value.replace(/\D/g, "");

                        otpForm.setFieldValue(
                          "otp",
                          value
                        );
                      }}
                      onBlur={otpForm.handleBlur}
                      className={`w-full h-14 border ${
                        otpForm.touched.otp &&
                        otpForm.errors.otp
                          ? "border-red-400"
                          : "border-black/15"
                      } focus:border-black text-2xl tracking-[0.4em] text-center outline-none`}
                    />

                    {otpForm.touched.otp &&
                      otpForm.errors.otp && (
                        <p className="mt-2 text-xs text-red-600 text-center">
                          {otpForm.errors.otp}
                        </p>
                      )}

                  </div>


                  <ErrorMessage />


                  <button
                    type="submit"
                    disabled={otpForm.isSubmitting}
                    className="w-full h-14 bg-black text-white flex items-center justify-center gap-3 text-xs font-semibold hover:bg-black/85 disabled:opacity-50"
                  >

                    {otpForm.isSubmitting
                      ? "Verifying..."
                      : "Verify OTP"}

                    {!otpForm.isSubmitting && (
                      <ArrowRight size={15} />
                    )}

                  </button>


                  <div className="flex justify-center gap-5">

                    <button
                      type="button"
                      onClick={handleResend}
                      className="text-xs text-black/50 hover:text-black"
                    >
                      Resend OTP
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setStep("email");
                        setSubmitError("");
                        otpForm.resetForm();
                      }}
                      className="text-xs text-black/50 hover:text-black"
                    >
                      Change Email
                    </button>

                  </div>

                </form>

              </div>

            )}


            {/* RESET PASSWORD */}

            {step === "reset" && (

              <div>

                <h1 className="text-4xl sm:text-5xl font-light tracking-[-0.05em]">
                  Reset
                  <br />
                  <span className="text-black/40">
                    Password
                  </span>
                </h1>

                <p className="mt-5 text-sm text-black/50">
                  Create a new password for your account.
                </p>


                <form
                  onSubmit={resetForm.handleSubmit}
                  noValidate
                  className="mt-8 space-y-5"
                >


                  {/* NEW PASSWORD */}

                  <div>

                    <label
                      htmlFor="newPassword"
                      className="block text-xs font-medium mb-2"
                    >
                      New Password
                    </label>

                    <div className="relative">

                      <input
                        id="newPassword"
                        name="newPassword"
                        type={showNew ? "text" : "password"}
                        placeholder="Enter new password"
                        autoComplete="new-password"
                        value={resetForm.values.newPassword}
                        onChange={resetForm.handleChange}
                        onBlur={resetForm.handleBlur}
                        className="w-full h-14 border border-black/15 focus:border-black px-4 pr-12 outline-none"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowNew((value) => !value)
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 hover:text-black"
                      >

                        {showNew ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}

                      </button>

                    </div>


                    {resetForm.touched.newPassword &&
                      resetForm.errors.newPassword && (
                        <p className="mt-2 text-xs text-red-600">
                          {resetForm.errors.newPassword}
                        </p>
                      )}

                  </div>


                  {/* CONFIRM PASSWORD */}

                  <div>

                    <label
                      htmlFor="confirmPassword"
                      className="block text-xs font-medium mb-2"
                    >
                      Confirm Password
                    </label>

                    <div className="relative">

                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={
                          showConfirm
                            ? "text"
                            : "password"
                        }
                        placeholder="Confirm new password"
                        autoComplete="new-password"
                        value={resetForm.values.confirmPassword}
                        onChange={resetForm.handleChange}
                        onBlur={resetForm.handleBlur}
                        className="w-full h-14 border border-black/15 focus:border-black px-4 pr-12 outline-none"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirm(
                            (value) => !value
                          )
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 hover:text-black"
                      >

                        {showConfirm ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}

                      </button>

                    </div>


                    {resetForm.touched.confirmPassword &&
                      resetForm.errors.confirmPassword && (
                        <p className="mt-2 text-xs text-red-600">
                          {resetForm.errors.confirmPassword}
                        </p>
                      )}

                  </div>


                  {/* PASSWORD REQUIREMENTS */}

                  <div className="border border-black/10 p-4">

                    <p className="text-xs font-medium mb-3">
                      Password Requirements
                    </p>

                    <div className="space-y-2">

                      {LIVE_RULES.map((rule) => {

                        const met = rule.test(
                          resetForm.values.newPassword
                        );

                        return (

                          <div
                            key={rule.key}
                            className="flex items-center gap-2"
                          >

                            <span
                              className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                met
                                  ? "bg-black text-white"
                                  : "border border-black/20"
                              }`}
                            >

                              {met && (
                                <Check
                                  size={10}
                                  strokeWidth={3}
                                />
                              )}

                            </span>

                            <span
                              className={`text-xs ${
                                met
                                  ? "text-black"
                                  : "text-black/40"
                              }`}
                            >
                              {rule.label}
                            </span>

                          </div>

                        );

                      })}

                    </div>

                  </div>


                  <ErrorMessage />


                  <button
                    type="submit"
                    disabled={resetForm.isSubmitting}
                    className="w-full h-14 bg-black text-white flex items-center justify-center gap-3 text-xs font-semibold hover:bg-black/85 disabled:opacity-50"
                  >

                    {resetForm.isSubmitting
                      ? "Updating..."
                      : "Reset Password"}

                    {!resetForm.isSubmitting && (
                      <ArrowRight size={15} />
                    )}

                  </button>

                </form>

              </div>

            )}


            {/* SUCCESS */}

            {step === "done" && (

              <div className="text-center">

                <div className="w-16 h-16 mx-auto mb-6 rounded-full border border-black/20 flex items-center justify-center">

                  <Check size={28} />

                </div>


                <h1 className="text-4xl font-light tracking-[-0.05em]">

                  Password
                  <br />

                  <span className="text-black/40">
                    Updated
                  </span>

                </h1>


                <p className="mt-5 text-sm text-black/50">
                  Your password has been successfully updated.
                </p>


                <Link
                  to="/login"
                  className="inline-flex items-center gap-3 mt-8 border border-black/15 px-6 py-3 text-xs font-semibold hover:border-black"
                >
                  Continue to Login
                  <ArrowRight size={14} />
                </Link>

              </div>

            )}

          </div>

        </div>


        <footer className="px-6 sm:px-10 lg:px-14 py-5 border-t border-black/10 text-center">

          <span className="text-xs text-black/25">
            © CHRONOS
          </span>

        </footer>

      </section>

    </main>
  );
}

