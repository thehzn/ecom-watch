import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Mail, ArrowLeft, Eye, EyeOff, Check, KeyRound, ArrowRight } from "lucide-react";

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000');
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

const LIVE_RULES = [
  { key: "length", label: "Minimum 8 characters", test: (v) => v.length >= 8 },
  { key: "upper", label: "1 uppercase & 1 lowercase letter", test: (v) => /[A-Z]/.test(v) && /[a-z]/.test(v) },
  { key: "numberOrSymbol", label: "1 number & 1 special symbol", test: (v) => /\d/.test(v) && /[^A-Za-z0-9]/.test(v) },
];

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

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const emailForm = useFormik({
    initialValues: { email: "" },
    validationSchema: Yup.object({
      email: Yup.string().email("Enter a valid email address").required("Email is required"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitError("");
      try {
        await apiPost("/apiauth/user/sendotp", { email: values.email });
        setEmail(values.email);
        setStep("otp");
      } catch (err) {
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

  const otpForm = useFormik({
    initialValues: { otp: "" },
    validationSchema: Yup.object({
      otp: Yup.string()
        .matches(/^\d{6}$/, "Enter the 6-digit verification code")
        .required("Code is required"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitError("");
      try {
        const data = await apiPost("/apiauth/user/verifyotp", { email, otp: values.otp });
        setResetToken(data.resetToken);
        setStep("reset");
      } catch (err) {
        setSubmitError(err.message || "Invalid or expired authentication code.");
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

  const resetForm = useFormik({
    initialValues: { newPassword: "", confirmPassword: "" },
    validationSchema: Yup.object({
      newPassword: Yup.string()
        .required("New password is required")
        .matches(passwordRegex, "Must be at least 8 characters with uppercase, lowercase, number and symbol"),
      confirmPassword: Yup.string()
        .required("Please confirm your new password")
        .oneOf([Yup.ref("newPassword")], "Passwords do not match"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitError("");
      try {
        await apiPost("/apiauth/user/resetpassword", {
          resetToken,
          password: values.newPassword,
          confirmPassword: values.confirmPassword,
        });
        setStep("done");
        setTimeout(() => navigate("/login"), 1800);
      } catch (err) {
        setSubmitError(err.message || "Session expired. Please request a new security code.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen w-full bg-[#08090C] text-white flex flex-col justify-between font-['Plus_Jakarta_Sans'] selection:bg-white selection:text-black relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] sm:w-[900px] h-[650px] sm:h-[900px] bg-[radial-gradient(circle,_rgba(255,255,255,0.06)_0%,_rgba(8,9,12,0)_70%)] pointer-events-none" />

      <header className="w-full border-b border-white/10 bg-[#08090C]/80 backdrop-blur-xl px-6 py-5 sm:px-12 flex items-center justify-between z-20">
        <Link to="/" className="flex flex-col group">
          <span className="text-xl sm:text-2xl font-bold tracking-[0.25em] text-white group-hover:text-gray-300 transition-colors">
            CHRONOS
          </span>
          <span className="text-[8px] tracking-[0.35em] text-gray-400 uppercase font-semibold">
            Haute Horlogerie
          </span>
        </Link>
        <Link
          to="/login"
          className="text-xs uppercase tracking-[0.18em] font-semibold text-gray-300 hover:text-white transition-colors"
        >
          Return to Login
        </Link>
      </header>

      <main className="relative flex-1 flex items-center justify-center px-6 py-12 z-10">
        <div className="w-full max-w-[480px] bg-[#0E1015]/90 border border-white/15 backdrop-blur-2xl rounded-3xl p-8 sm:p-12 shadow-2xl">
          
          {step === "email" && (
            <div>
              <div className="text-center mb-8">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white mx-auto mb-4">
                  <KeyRound size={22} />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Recover Access
                </h1>
                <p className="text-xs sm:text-sm text-gray-400 mt-2">
                  Enter your registered client email to receive a 6-digit security verification code.
                </p>
              </div>

              <form onSubmit={emailForm.handleSubmit} noValidate className="flex flex-col gap-5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Client Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="client@chronos.com"
                    value={emailForm.values.email}
                    onChange={emailForm.handleChange}
                    onBlur={emailForm.handleBlur}
                    className="w-full bg-[#141720] border border-white/15 focus:border-white text-white text-sm rounded-xl px-4 py-3.5 outline-none transition-colors"
                  />
                  {emailForm.touched.email && emailForm.errors.email && (
                    <p className="text-red-400 text-xs mt-1.5">{emailForm.errors.email}</p>
                  )}
                </div>

                {submitError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 text-center">
                    {submitError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={emailForm.isSubmitting}
                  className="mt-2 w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-200 text-black text-xs font-bold uppercase tracking-[0.2em] py-4 rounded-full shadow-lg transition-all disabled:opacity-60"
                >
                  <span>{emailForm.isSubmitting ? "Dispatching Code…" : "Send Authentication Code"}</span>
                  <ArrowRight size={15} />
                </button>

                <div className="flex justify-center mt-4">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
                  >
                    <ArrowLeft size={14} />
                    <span>Back to Client Sign In</span>
                  </Link>
                </div>
              </form>
            </div>
          )}

          {step === "otp" && (
            <div>
              <div className="text-center mb-8">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white mx-auto mb-4">
                  <Mail size={22} />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Verify Security Code
                </h1>
                <p className="text-xs sm:text-sm text-gray-400 mt-2 leading-relaxed">
                  Enter the 6-digit code transmitted to <br />
                  <span className="text-white font-medium">{email}</span>. Valid for 5 minutes.
                </p>
              </div>

              <form onSubmit={otpForm.handleSubmit} noValidate className="flex flex-col gap-6">
                <div>
                  <input
                    type="text"
                    inputMode="numeric"
                    name="otp"
                    placeholder="••••••"
                    maxLength={6}
                    value={otpForm.values.otp}
                    onChange={otpForm.handleChange}
                    onBlur={otpForm.handleBlur}
                    className="w-full bg-[#141720] border border-white/20 focus:border-white text-white text-2xl font-bold tracking-[0.6em] text-center rounded-2xl py-4 outline-none transition-colors"
                  />
                  {otpForm.touched.otp && otpForm.errors.otp && (
                    <p className="text-red-400 text-xs mt-2 text-center">{otpForm.errors.otp}</p>
                  )}
                </div>

                {submitError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 text-center">
                    {submitError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={otpForm.isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-200 text-black text-xs font-bold uppercase tracking-[0.2em] py-4 rounded-full shadow-lg transition-all disabled:opacity-60"
                >
                  <span>{otpForm.isSubmitting ? "Verifying Code…" : "Authenticate Code"}</span>
                  <ArrowRight size={15} />
                </button>

                <div className="flex flex-col items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleResend}
                    className="text-xs uppercase tracking-wider font-bold text-gray-300 hover:text-white transition-colors"
                  >
                    Resend Authentication Code
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStep("email");
                      setSubmitError("");
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    <ArrowLeft size={13} />
                    <span>Change Email Address</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === "reset" && (
            <div>
              <div className="text-center mb-8">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white mx-auto mb-4">
                  <KeyRound size={22} />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Set New Password
                </h1>
                <p className="text-xs sm:text-sm text-gray-400 mt-2">
                  Choose an encrypted password to protect your client account.
                </p>
              </div>

              <form onSubmit={resetForm.handleSubmit} noValidate className="flex flex-col gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    New Password
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="newPassword"
                      name="newPassword"
                      type={showNew ? "text" : "password"}
                      placeholder="••••••••••••"
                      autoComplete="new-password"
                      value={resetForm.values.newPassword}
                      onChange={resetForm.handleChange}
                      onBlur={resetForm.handleBlur}
                      className="w-full bg-[#141720] border border-white/15 focus:border-white text-white text-sm rounded-xl px-4 py-3.5 pr-11 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((s) => !s)}
                      className="absolute right-3.5 text-gray-400 hover:text-white"
                      tabIndex={-1}
                    >
                      {showNew ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  {resetForm.touched.newPassword && resetForm.errors.newPassword && (
                    <p className="text-red-400 text-xs mt-1">{resetForm.errors.newPassword}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      placeholder="••••••••••••"
                      autoComplete="new-password"
                      value={resetForm.values.confirmPassword}
                      onChange={resetForm.handleChange}
                      onBlur={resetForm.handleBlur}
                      className="w-full bg-[#141720] border border-white/15 focus:border-white text-white text-sm rounded-xl px-4 py-3.5 pr-11 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((s) => !s)}
                      className="absolute right-3.5 text-gray-400 hover:text-white"
                      tabIndex={-1}
                    >
                      {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  {resetForm.touched.confirmPassword && resetForm.errors.confirmPassword && (
                    <p className="text-red-400 text-xs mt-1">{resetForm.errors.confirmPassword}</p>
                  )}
                </div>

                <div className="bg-[#141720] border border-white/10 rounded-2xl p-4 flex flex-col gap-2 mt-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Security Standard:</span>
                  {LIVE_RULES.map((rule) => {
                    const met = rule.test(resetForm.values.newPassword);
                    return (
                      <div key={rule.key} className="flex items-center gap-2.5">
                        <span
                          className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all ${
                            met ? "bg-white text-black" : "border border-white/30 text-transparent"
                          }`}
                        >
                          {met && <Check size={10} strokeWidth={3} />}
                        </span>
                        <span className={`text-xs ${met ? "text-white font-medium" : "text-gray-400"}`}>
                          {rule.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {submitError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 text-center">
                    {submitError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={resetForm.isSubmitting}
                  className="mt-3 w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-200 text-black text-xs font-bold uppercase tracking-[0.2em] py-4 rounded-full shadow-lg transition-all disabled:opacity-60"
                >
                  <span>{resetForm.isSubmitting ? "Updating Password…" : "Confirm Password"}</span>
                  <ArrowRight size={15} />
                </button>
              </form>
            </div>
          )}

          {step === "done" && (
            <div className="flex flex-col items-center text-center py-6">
              <div className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                <Check size={30} strokeWidth={2.5} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400">
                Security Confirmed
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mt-2">
                Password Updated
              </h2>
              <p className="mt-3 text-sm text-gray-300">
                Your credentials have been securely updated. Redirecting to client login...
              </p>
            </div>
          )}

        </div>
      </main>

      <footer className="w-full border-t border-white/5 py-4 px-6 text-center text-[10px] text-gray-500 tracking-widest uppercase">
        256-Bit Encrypted Atelier Access • Geneva Standard
      </footer>
    </div>
  );
}
