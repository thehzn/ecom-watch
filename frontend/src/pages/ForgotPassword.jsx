import { useState } from "react";
import { Link } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Mail, ArrowLeft } from "lucide-react";
import { useApi } from "../hooks/useApi"; 

const emailSchema = Yup.object({
  email: Yup.string().email("Enter a valid email address").required("Email is required"),
});

export default function ForgotPassword() {
  const { post } = useApi();
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const formik = useFormik({
    initialValues: { email: "" },
    validationSchema: emailSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitError("");å
      try {
        // Real endpoint: POST /apiauth/user/sendotp, body { email }.
        // Sends a 6-digit OTP by email (valid 5 minutes) — the real flow
        // is OTP-based, not a clickable reset link. This page only covers
        // that first step; a "verify OTP" + "set new password" page still
        // need to be built to complete the flow.
        await post("/apiauth/user/sendotp", { email: values.email }, { allowUnauthorized: true });
        setSubmitted(true);
      } catch (err) {
        // Backend returns 401 "Invalid Mail id" for unregistered emails —
        // but the BRD's success copy ("if an account exists...") is
        // deliberately written to not reveal whether an email is
        // registered. So that specific case is treated as success too;
        // only genuine failures (network/server errors) surface as errors.
        const message = err.message || "";
        if (message.toLowerCase().includes("invalid mail")) {
          setSubmitted(true);
        } else {
          setSubmitError(message || "Something went wrong. Please try again.");
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  const inputClass =
    "w-full bg-transparent py-4 font-['Inter'] text-[16px] text-black placeholder:text-[#5D5E63]/60 border-b transition-colors focus:outline-none focus:border-black";

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F9F9F9" }}>
      {/* Header */}
      <header className="sticky top-0 z-10 w-full flex justify-center pt-8 pb-6" style={{ backgroundColor: "#F9F9F9" }}>
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

      {/* Reset Password section */}
      <main className="flex-1 flex items-center justify-center px-5 py-16">
        <div className="w-full" style={{ maxWidth: "420px" }}>
          {!submitted ? (
            <>
              <h1
                className="text-center text-black mb-10"
                style={{
                  fontFamily: "'Libre Caslon Text', serif",
                  fontSize: "32px",
                  fontWeight: 400,
                  lineHeight: "40px",
                }}
              >
                Reset Your Password
              </h1>

              <form onSubmit={formik.handleSubmit} noValidate className="flex flex-col gap-6">
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="name@maison.com"
                    className={inputClass}
                    style={{ borderColor: "rgba(93,94,99,0.3)" }}
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <p className="text-red-600 text-xs mt-2">{formik.errors.email}</p>
                  )}
                </div>

                {submitError && <p className="text-red-600 text-xs">{submitError}</p>}

                <button
                  type="submit"
                  disabled={formik.isSubmitting}
                  className="group w-full text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: "#000000",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "12px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    padding: "20px 0",
                    transitionDuration: "400ms",
                    transitionProperty: "letter-spacing, opacity",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.letterSpacing = "0.2em";
                    e.currentTarget.style.opacity = "0.9";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.letterSpacing = "0.1em";
                    e.currentTarget.style.opacity = "1";
                  }}
                >
                  {formik.isSubmitting ? "Sending..." : "Send Reset Link"}
                </button>
              </form>

              <div className="flex justify-center mt-8">
                <Link
                  to="/login"
                  className="group inline-flex items-center gap-2 transition-colors"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#5D5E63",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#000000")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#5D5E63")}
                >
                  <ArrowLeft size={14} />
                  <span className="group-hover:underline">Return to Login</span>
                </Link>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center text-center">
              <Mail size={40} color="#5D5E63" strokeWidth={1.5} />
              <h1
                className="mt-6 text-black"
                style={{
                  fontFamily: "'Libre Caslon Text', serif",
                  fontSize: "32px",
                  fontWeight: 400,
                  lineHeight: "40px",
                }}
              >
                Check your Inbox
              </h1>
              <p
                className="mt-4"
                style={{ fontFamily: "Inter, sans-serif", fontSize: "16px", color: "#5D5E63" }}
              >
                If an account exists for that email, you will receive password
                reset instructions shortly.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  formik.resetForm();
                }}
                className="mt-8 text-black underline-offset-4 hover:underline"
                style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600 }}
              >
                Try another email
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
