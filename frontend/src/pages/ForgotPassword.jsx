import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Mail, ArrowLeft, Eye, EyeOff, Check } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL;

// Same policy the backend enforces (register / resetpassword controllers) —
// kept in sync so the client never accepts something the server would reject.
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

const LIVE_RULES = [
  { key: "length", label: "Minimum 8 characters", test: (v) => v.length >= 8 },
  {
    key: "numberOrSymbol",
    label: "Includes numbers or symbols",
    test: (v) => /\d/.test(v) || /[^A-Za-z0-9]/.test(v),
  },
];

// This entire flow talks to PUBLIC endpoints (no auth token), so it uses raw
// fetch directly — same as Login.jsx — instead of the useApi hook. useApi
// treats any 401 as "session expired" and force-navigates to /login, which
// breaks these endpoints: sendotp/verifyotp legitimately return 401 for
// "email not found" / "OTP invalid", which is a normal in-flow error here,
// not an expired session.
async function apiPost(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || (data && data.status === false)) {
    throw new Error((data && data.message) || `Request failed: ${res.status}`);
  }
  return data;
}

const inputClass =
  "w-full bg-transparent py-4 font-['Inter'] text-[16px] text-black placeholder:text-[#5D5E63]/60 border-b transition-colors focus:outline-none focus:border-black";

const headingStyle = {
  fontFamily: "'Libre Caslon Text', serif",
  fontSize: "32px",
  fontWeight: 400,
  lineHeight: "40px",
};

const submitButtonClass =
  "w-full text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed";
const submitButtonStyle = {
  backgroundColor: "#000000",
  fontFamily: "Inter, sans-serif",
  fontSize: "12px",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  padding: "20px 0",
  transitionDuration: "400ms",
  transitionProperty: "letter-spacing, opacity",
};
const onButtonEnter = (e) => {
  e.currentTarget.style.letterSpacing = "0.2em";
  e.currentTarget.style.opacity = "0.9";
};
const onButtonLeave = (e) => {
  e.currentTarget.style.letterSpacing = "0.1em";
  e.currentTarget.style.opacity = "1";
};

export default function ForgotPassword() {
  const navigate = useNavigate();

  // email -> otp -> reset -> done
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // --- Step 1: email ---
  const emailForm = useFormik({
    initialValues: { email: "" },
    validationSchema: Yup.object({
      email: Yup.string().email("Enter a valid email address").required("Email is required"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitError("");
      try {
        // Real endpoint: POST /apiauth/user/sendotp, body { email }.
        // Sends a 6-digit OTP by email, valid 5 minutes.
        await apiPost("/apiauth/user/sendotp", { email: values.email });
        setEmail(values.email);
        setStep("otp");
      } catch (err) {
        // Backend returns "Invalid Mail id" for unregistered emails. The BRD's
        // intent is to not reveal whether an email is registered, so that
        // specific case still advances to the OTP step; only genuine
        // failures (network/server errors) surface as an error here.
        if ((err.message || "").toLowerCase().includes("invalid mail")) {
          setEmail(values.email);
          setStep("otp");
        } else {
          setSubmitError(err.message || "Something went wrong. Please try again.");
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  // --- Step 2: OTP ---
  const otpForm = useFormik({
    initialValues: { otp: "" },
    validationSchema: Yup.object({
      otp: Yup.string()
        .matches(/^\d{6}$/, "Enter the 6-digit code")
        .required("Code is required"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitError("");
      try {
        // Real endpoint: POST /apiauth/user/verifyotp, body { email, otp }.
        // Returns { resetToken } (valid 10 minutes) once the code checks out.
        const data = await apiPost("/apiauth/user/verifyotp", { email, otp: values.otp });
        setResetToken(data.resetToken);
        setStep("reset");
      } catch (err) {
        setSubmitError(err.message || "Something went wrong. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleResend = async () => {
    setSubmitError("");
    try {
      await apiPost("/apiauth/user/sendotp", { email });
    } catch (err) {
      setSubmitError(err.message || "Could not resend the code. Please try again.");
    }
  };

  // --- Step 3: new password ---
  const resetForm = useFormik({
    initialValues: { newPassword: "", confirmPassword: "" },
    validationSchema: Yup.object({
      newPassword: Yup.string()
        .required("New password is required")
        .matches(
          passwordRegex,
          "Must be at least 8 characters and include 1 uppercase, 1 lowercase, 1 number and 1 special character"
        ),
      confirmPassword: Yup.string()
        .required("Please confirm your new password")
        .oneOf([Yup.ref("newPassword")], "Passwords do not match"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitError("");
      try {
        // Real endpoint: POST /apiauth/user/resetpassword,
        // body { resetToken, password, confirmPassword }.
        await apiPost("/apiauth/user/resetpassword", {
          resetToken,
          password: values.newPassword,
          confirmPassword: values.confirmPassword,
        });
        setStep("done");
        setTimeout(() => navigate("/login"), 1500);
      } catch (err) {
        // Token expired (10 min) or otherwise invalid — send them back to
        // request a fresh code rather than dead-ending on this step.
        setSubmitError(err.message || "Something went wrong. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F9F9F9" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10 w-full flex justify-center pt-8 pb-6"
        style={{ backgroundColor: "#F9F9F9" }}
      >
        <Link
          to="/"
          className="text-black"
          style={{
            fontFamily: "'Libre Caslon Text', serif",
            fontSize: "24px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.25em",
          }}
        >
          CHRONOS
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-5 py-16">
        <div className="w-full" style={{ maxWidth: "420px" }}>
          {/* Step 1 — request a code */}
          {step === "email" && (
            <>
              <h1 className="text-center text-black mb-10" style={headingStyle}>
                Reset Your Password
              </h1>

              <form onSubmit={emailForm.handleSubmit} noValidate className="flex flex-col gap-6">
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="name@maison.com"
                    className={inputClass}
                    style={{ borderColor: "rgba(93,94,99,0.3)" }}
                    value={emailForm.values.email}
                    onChange={emailForm.handleChange}
                    onBlur={emailForm.handleBlur}
                  />
                  {emailForm.touched.email && emailForm.errors.email && (
                    <p className="text-red-600 text-xs mt-2">{emailForm.errors.email}</p>
                  )}
                </div>

                {submitError && <p className="text-red-600 text-xs">{submitError}</p>}

                <button
                  type="submit"
                  disabled={emailForm.isSubmitting}
                  className={submitButtonClass}
                  style={submitButtonStyle}
                  onMouseEnter={onButtonEnter}
                  onMouseLeave={onButtonLeave}
                >
                  {emailForm.isSubmitting ? "Sending..." : "Send Code"}
                </button>
              </form>

              <div className="flex justify-center mt-8">
                <Link
                  to="/login"
                  className="group inline-flex items-center gap-2 transition-colors"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600, color: "#5D5E63" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#000000")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#5D5E63")}
                >
                  <ArrowLeft size={14} />
                  <span className="group-hover:underline">Return to Login</span>
                </Link>
              </div>
            </>
          )}

          {/* Step 2 — enter the OTP */}
          {step === "otp" && (
            <>
              <div className="flex flex-col items-center text-center mb-10">
                <Mail size={40} color="#5D5E63" strokeWidth={1.5} />
                <h1 className="mt-6 text-black" style={headingStyle}>
                  Check your Inbox
                </h1>
                <p className="mt-4" style={{ fontFamily: "Inter, sans-serif", fontSize: "16px", color: "#5D5E63" }}>
                  Enter the 6-digit code we sent to {email}. It's valid for 5 minutes.
                </p>
              </div>

              <form onSubmit={otpForm.handleSubmit} noValidate className="flex flex-col gap-6">
                <div>
                  <input
                    type="text"
                    inputMode="numeric"
                    name="otp"
                    placeholder="123456"
                    maxLength={6}
                    className={`${inputClass} text-center tracking-[0.5em]`}
                    style={{ borderColor: "rgba(93,94,99,0.3)" }}
                    value={otpForm.values.otp}
                    onChange={otpForm.handleChange}
                    onBlur={otpForm.handleBlur}
                  />
                  {otpForm.touched.otp && otpForm.errors.otp && (
                    <p className="text-red-600 text-xs mt-2 text-center">{otpForm.errors.otp}</p>
                  )}
                </div>

                {submitError && <p className="text-red-600 text-xs text-center">{submitError}</p>}

                <button
                  type="submit"
                  disabled={otpForm.isSubmitting}
                  className={submitButtonClass}
                  style={submitButtonStyle}
                  onMouseEnter={onButtonEnter}
                  onMouseLeave={onButtonLeave}
                >
                  {otpForm.isSubmitting ? "Verifying..." : "Verify Code"}
                </button>
              </form>

              <div className="flex flex-col items-center gap-3 mt-8">
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-black underline-offset-4 hover:underline"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600 }}
                >
                  Resend code
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setSubmitError("");
                  }}
                  className="group inline-flex items-center gap-2 transition-colors"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600, color: "#5D5E63" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#000000")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#5D5E63")}
                >
                  <ArrowLeft size={14} />
                  <span className="group-hover:underline">Try another email</span>
                </button>
              </div>
            </>
          )}

          {/* Step 3 — set a new password */}
          {step === "reset" && (
            <>
              <h1 className="text-center text-black mb-10" style={headingStyle}>
                Set a New Password
              </h1>

              <form onSubmit={resetForm.handleSubmit} noValidate className="flex flex-col gap-5">
                <div>
                  <div className="relative flex items-center">
                    <input
                      id="newPassword"
                      name="newPassword"
                      type={showNew ? "text" : "password"}
                      placeholder="New Password"
                      autoComplete="new-password"
                      className={`${inputClass} pr-8`}
                      style={{ borderColor: "rgba(93,94,99,0.3)" }}
                      value={resetForm.values.newPassword}
                      onChange={resetForm.handleChange}
                      onBlur={resetForm.handleBlur}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((s) => !s)}
                      className="absolute right-0 text-[#5D5E63] hover:text-black"
                      tabIndex={-1}
                      aria-label={showNew ? "Hide password" : "Show password"}
                    >
                      {showNew ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
                    </button>
                  </div>
                  {resetForm.touched.newPassword && resetForm.errors.newPassword && (
                    <p className="text-red-600 text-xs mt-2">{resetForm.errors.newPassword}</p>
                  )}
                </div>

                <div>
                  <div className="relative flex items-center">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Confirm New Password"
                      autoComplete="new-password"
                      className={`${inputClass} pr-8`}
                      style={{ borderColor: "rgba(93,94,99,0.3)" }}
                      value={resetForm.values.confirmPassword}
                      onChange={resetForm.handleChange}
                      onBlur={resetForm.handleBlur}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((s) => !s)}
                      className="absolute right-0 text-[#5D5E63] hover:text-black"
                      tabIndex={-1}
                      aria-label={showConfirm ? "Hide password" : "Show password"}
                    >
                      {showConfirm ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
                    </button>
                  </div>
                  {resetForm.touched.confirmPassword && resetForm.errors.confirmPassword && (
                    <p className="text-red-600 text-xs mt-2">{resetForm.errors.confirmPassword}</p>
                  )}
                </div>

                <div className="bg-[#F0F0F0] rounded-md p-4 flex flex-col gap-2">
                  {LIVE_RULES.map((rule) => {
                    const met = rule.test(resetForm.values.newPassword);
                    return (
                      <div key={rule.key} className="flex items-center gap-2">
                        <span
                          className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                            met ? "bg-black" : "border border-[#C4C7C7]"
                          }`}
                        >
                          {met && <Check size={11} color="#FFFFFF" strokeWidth={3} />}
                        </span>
                        <span
                          className={met ? "text-black" : "text-[#5D5E63]"}
                          style={{ fontFamily: "Inter, sans-serif", fontSize: "13px" }}
                        >
                          {rule.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {submitError && <p className="text-red-600 text-xs">{submitError}</p>}

                <button
                  type="submit"
                  disabled={resetForm.isSubmitting}
                  className={submitButtonClass}
                  style={submitButtonStyle}
                  onMouseEnter={onButtonEnter}
                  onMouseLeave={onButtonLeave}
                >
                  {resetForm.isSubmitting ? "Updating..." : "Update Password"}
                </button>
              </form>
            </>
          )}

          {/* Step 4 — done */}
          {step === "done" && (
            <div className="flex flex-col items-center text-center">
              <Check size={40} color="#5D5E63" strokeWidth={1.5} />
              <h1 className="mt-6 text-black" style={headingStyle}>
                Password Updated
              </h1>
              <p className="mt-4" style={{ fontFamily: "Inter, sans-serif", fontSize: "16px", color: "#5D5E63" }}>
                Taking you to sign in...
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
